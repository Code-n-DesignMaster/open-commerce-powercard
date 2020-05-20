import { ValidationPipe, ArgumentMetadata } from '@nestjs/common';
import { ValidationError } from 'apollo-server-core';
import { get } from 'lodash';
import { OCUserInputError } from './errors/OCUserInputError';

export const VALIDATION_ERROR = 'VALIDATION_ERROR';

export class ApolloValidationPipe extends ValidationPipe {
  public async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (error) {
      let messages = [];
      const validationErrors: ValidationError[] = get(error, 'message.message');
      validationErrors.forEach((ve: ValidationError) => {
        messages = messages.concat(Object.values(ve.constraints));
      });

      const message = messages.join('; ');
      throw new OCUserInputError(message, {
        details: error,
      });
    }
  }
}
