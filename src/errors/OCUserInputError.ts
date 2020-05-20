import { ApolloError } from 'apollo-server-core';

export const OC_BAD_USER_INPUT_ERROR = 'OC_BAD_USER_INPUT_ERROR';

export class OCUserInputError extends ApolloError {
  constructor(message: string, properties?: Record<string, any>) {
    super(message, OC_BAD_USER_INPUT_ERROR, properties);

    Object.defineProperty(this, 'name', { value: 'OCUserInputError' });
  }
}
