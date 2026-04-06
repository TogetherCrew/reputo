import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  DownloadDto,
  DownloadResponseDto,
  UploadDto,
  UploadResponseDto,
  VerifyResponseDto,
  VerifyUploadDto,
} from './dto';
import { StorageService } from './storage.service';

/** Sanitize filename for Content-Disposition: strip control chars and quotes to prevent header injection. */
function sanitizeFilename(filename: string): string {
  let out = '';
  for (let i = 0; i < filename.length; i++) {
    const code = filename.charCodeAt(i);
    if (
      code <= 31 ||
      code === 127 ||
      filename[i] === '"' ||
      filename[i] === '\\' ||
      filename[i] === '\r' ||
      filename[i] === '\n'
    ) {
      out += '_';
    } else {
      out += filename[i];
    }
  }
  return out.replace(/^\.+/, '') || 'download';
}

@ApiTags('Storage')
@ApiUnauthorizedResponse({ description: 'Deep ID-backed session required.' })
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('uploads')
  @ApiOperation({
    summary: 'Create presigned upload URL',
    description: 'Generates a presigned PUT URL for direct-to-S3 file upload.',
  })
  @ApiBody({ type: UploadDto })
  @ApiCreatedResponse({
    description: 'Presigned upload URL successfully created',
    type: UploadResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid content type or bad request',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to generate presigned URL',
  })
  async upload(@Body() dto: UploadDto): Promise<UploadResponseDto> {
    return await this.storageService.presignPut(dto.filename, dto.contentType);
  }

  @Post('uploads/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify uploaded file',
    description: 'Confirms the object exists in S3 and complies with the configured storage policy.',
  })
  @ApiBody({ type: VerifyUploadDto })
  @ApiOkResponse({
    description: 'Object verified successfully',
    type: VerifyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'File too large or invalid content type',
  })
  @ApiNotFoundResponse({
    description: 'Object not found in S3',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to check object metadata',
  })
  async verifyUpload(@Body() dto: VerifyUploadDto): Promise<VerifyResponseDto> {
    return await this.storageService.verifyUpload(dto.key);
  }

  @Post('downloads')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create presigned download URL',
    description: 'Generates a short-lived presigned GET URL for downloading a file.',
  })
  @ApiBody({ type: DownloadDto })
  @ApiOkResponse({
    description: 'Presigned download URL successfully created',
    type: DownloadResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
  })
  @ApiNotFoundResponse({
    description: 'Object not found in S3',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to generate presigned URL',
  })
  async download(@Body() dto: DownloadDto): Promise<DownloadResponseDto> {
    return await this.storageService.presignGet(dto.key);
  }

  @Get('stream')
  @ApiOperation({
    summary: 'Stream file for download',
    description:
      'Proxies the file from storage with Content-Disposition: attachment so the browser downloads it instead of opening a new tab.',
  })
  @ApiQuery({ name: 'key', required: true, description: 'Storage key of the file' })
  @ApiOkResponse({ description: 'File stream' })
  @ApiNotFoundResponse({ description: 'Object not found' })
  @ApiInternalServerErrorResponse({ description: 'Failed to stream file' })
  async stream(@Query('key') key: string, @Res({ passthrough: true }) res: Response): Promise<void> {
    const [buffer, metadata] = await Promise.all([
      this.storageService.getObject(key),
      this.storageService.getObjectMetadata(key),
    ]);
    const rawFilename = metadata.filename || key.split('/').pop() || 'download';
    const filename = sanitizeFilename(rawFilename);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');
    res.send(buffer);
  }
}
