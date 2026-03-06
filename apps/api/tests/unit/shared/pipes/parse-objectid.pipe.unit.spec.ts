import type { ArgumentMetadata } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ParseObjectIdPipe } from '../../../../src/shared/pipes/parse-objectid.pipe';

describe('ParseObjectIdPipe', () => {
  const pipe = new ParseObjectIdPipe();

  it('returns the original value when the ObjectId is valid', () => {
    const metadata: ArgumentMetadata = {
      type: 'param',
      data: 'snapshotId',
      metatype: String,
    };

    expect(pipe.transform('507f1f77bcf86cd799439011', metadata)).toBe('507f1f77bcf86cd799439011');
  });

  it('throws a BadRequestException with the parameter name when the ObjectId is invalid', () => {
    const metadata: ArgumentMetadata = {
      type: 'param',
      data: 'algorithmPresetId',
      metatype: String,
    };

    expect(() => pipe.transform('not-an-object-id', metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform('not-an-object-id', metadata)).toThrow(
      'Invalid algorithmPresetId format. Expected a valid MongoDB ObjectId.',
    );
  });
});
