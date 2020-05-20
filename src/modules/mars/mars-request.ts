import axios from 'axios';
import { LoggerService } from '@open-commerce/nestjs-logger';

import { get } from 'lodash';
import { IMarsConfig } from '../../config/mars-config.interface';

export class MarsRequest {
  private readonly loggerContext = this.constructor.name;

  constructor(
    private logger: LoggerService,
    private readonly marsConfig: IMarsConfig,
  ) {
    if (logger === null) {
      throw new Error(`You must pass in LoggerService!`);
    }
    if (this.marsConfig.defaultTimeoutMs) {
      axios.defaults.timeout = this.marsConfig.defaultTimeoutMs;
    }
  }

  public async makeRequest(requestParameters: any) {
    const startTime = new Date();
    let response = null;

    if (this.marsConfig.enableMarsDebugRequestData) {
      let data = get(requestParameters, 'data');
      if (!data) {
        data = 'NONE';
      }
      this.logger.debug(
        `${this.getMarsEndpointFromUrl(
          get(requestParameters, 'url'),
        )} Request => ${JSON.stringify(data)}`,
        this.loggerContext,
      );
    }

    try {
      response = await axios(requestParameters);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        const timeout = get(requestParameters, 'timeout')
          ? get(requestParameters, 'timeout')
          : axios.defaults.timeout;
        this.logger.debug(
          `Request to ${this.getMarsEndpointFromUrl(
            get(requestParameters, 'url'),
          )} timed out after ${timeout} ms`,
          this.loggerContext,
        );
      } else {
        const finishTime = new Date();
        const responseTime = finishTime.getTime() - startTime.getTime();
        this.logger.debug(
          `Request to ${this.getMarsEndpointFromUrl(
            get(requestParameters, 'url'),
          )} FAILED => ${responseTime} ms`,
          this.loggerContext,
        );
      }

      throw error;
    }

    if (this.marsConfig.enableMarsRequestInstrumentation) {
      const finishTime = new Date();
      const responseTime = finishTime.getTime() - startTime.getTime();
      const method = get(requestParameters, 'method');
      this.logger.debug(
        `${this.getMarsEndpointFromUrl(
          get(requestParameters, 'url'),
        )} (${method}) => ${responseTime} ms`,
        this.loggerContext,
      );
    }

    if (this.marsConfig.enableMarsDebugResponseData) {
      if (response) {
        const responseData = get(response, 'data');
        if (!responseData) {
          this.logger.debug(
            `${this.getMarsEndpointFromUrl(
              get(requestParameters, 'url'),
            )} Response => Response had no data`,
            this.loggerContext,
          );
        } else {
          try {
            this.logger.debug(
              `${this.getMarsEndpointFromUrl(
                get(requestParameters, 'url'),
              )} Response => ${JSON.stringify(responseData)}`,
              this.loggerContext,
            );
          } catch {
            // Just making sure stringify doesn't blow up.
            this.logger.debug(
              `${this.getMarsEndpointFromUrl(
                get(requestParameters, 'url'),
              )} Response => Had issues displaying response data`,
              this.loggerContext,
            );
          }
        }
      } else {
        this.logger.debug(
          `${this.getMarsEndpointFromUrl(
            get(requestParameters, 'url'),
          )} Response => No response received from request`,
          this.loggerContext,
        );
      }
    }

    return response;
  }

  public getMarsEndpointFromUrl(url: any): string {
    if (url) {
      const endpoint = url.substring(url.lastIndexOf('/') + 1);
      return endpoint;
    } else {
      return 'UNKNOWN ENDPOINT';
    }
  }
}
