import { ISerializer } from '../../../interfaces/serializer.interface';
import { AxiosResponse } from 'axios';
import { IMarsApiResponse } from '../interfaces/IMarsApiResponse.interface';
import { Logger } from '@nestjs/common';

export class MarsSerializer implements ISerializer {
  private logger = new Logger();

  constructor(private readonly marsLoggingEnabled = false) {}

  public serialize(input: any) {
    throw new Error('serialize method must be overridden');
  }

  public deserialize(input: any): any {
    return this.buildMarsApiResponse(input);
  }

  protected log(message: string) {
    if (this.marsLoggingEnabled) {
      this.logger.log(message, this.constructor.name);
    }
  }

  protected logInput(input: object) {
    this.log(JSON.stringify(input));
  }

  protected logSerializing(input: object) {
    this.log(`Serializing: ${JSON.stringify(input)}`);
  }

  protected logDeserialized(result: object) {
    this.log(`Deserialized: ${JSON.stringify(result)}`);
  }

  protected logReceived(data: object) {
    this.log(`Received MARS Response: ${JSON.stringify(data)}`);
  }

  protected logSending(data: object) {
    this.log(`Sending MARS Request: ${JSON.stringify(data, null, 2)}`);
  }

  protected buildMarsApiResponse(response: AxiosResponse): IMarsApiResponse {
    const { status, data } = response;

    this.logReceived({
      status,
      data: {
        ...data,
      },
    });

    const success = status === 200 || status === 204;
    return {
      success,
    };
  }
}
