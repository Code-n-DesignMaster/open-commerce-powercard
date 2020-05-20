import { ApolloError } from 'apollo-server-core';

export class MarsApiError extends ApolloError {
  public url: string;
  public marsResponseStatus: number;
  public marsErrorMessage: string;
  // TODO: update this when available
  // public marsErrorCode: number;
  public timedOut: boolean;

  constructor(args: any) {
    super(args.marsErrorMessage, 'MARS_API_ERROR');
    Object.assign(this, args);
  }
}
