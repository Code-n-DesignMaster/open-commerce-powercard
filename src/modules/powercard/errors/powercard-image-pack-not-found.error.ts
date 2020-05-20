import { BaseError } from './base.error';

export const OC_POWERCARD_IMAGE_PACK_NOT_FOUND_ERROR =
  'OC_POWERCARD_IMAGE_PACK_NOT_FOUND_ERROR';

export class OCPowercardImagePackNotFoundError extends BaseError {
  constructor(imagePackUuid: string) {
    super(
      `could not find image pack with id: ${imagePackUuid} in the database, and failed to find the default image pack`,
      OC_POWERCARD_IMAGE_PACK_NOT_FOUND_ERROR,
    );
  }
}
