import { ApolloError } from 'apollo-server-core';

export class BaseError extends ApolloError {
  constructor(message: string, code: string, properties?: Record<string, any>) {
    super(message, code, properties);

    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
    });
  }
}
