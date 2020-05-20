import { ApolloError } from 'apollo-server-core';

export class BaseError extends ApolloError {
  constructor(message: string, code: string) {
    super(message, code);

    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
    });
  }
}
