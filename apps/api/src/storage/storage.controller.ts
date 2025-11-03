import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateUploadDto,
  DownloadResponseDto,
  SignDownloadDto,
  UploadResponseDto,
  VerifyResponseDto,
  VerifyUploadDto,
} from './dto';
import { StorageService } from './storage.service';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('uploads')
  @ApiOperation({
    summary: 'Create presigned upload URL',
    description: 'Generates a presigned PUT URL for direct-to-S3 file upload',
  })
  @ApiBody({ type: CreateUploadDto })
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
  async createUpload(@Body() dto: CreateUploadDto): Promise<UploadResponseDto> {
    return await this.storageService.presignPut(dto.contentType);
  }

  @Post('uploads/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify uploaded file',
    description: 'Confirms the object exists in S3 and complies with storage policy',
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
    description: 'Generates a short-lived presigned GET URL for downloading a file',
  })
  @ApiBody({ type: SignDownloadDto })
  @ApiOkResponse({
    description: 'Presigned download URL successfully created',
    type: DownloadResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Object not found in S3',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to generate presigned URL',
  })
  async signDownload(@Body() dto: SignDownloadDto): Promise<DownloadResponseDto> {
    return await this.storageService.presignGet(dto.key);
  }
}
