export interface IMarsConfig {
  timezone: string;
  apiUrl: string;
  clientKey: string;
  clientSecret: string;
  enableMock: boolean;
  enableLogging: boolean;
  tokenTimeoutInMinutes: number;
  cardBalanceCheckTimoutMs: number;
  transactionTimeoutMs: number;
  defaultTimeoutMs: number;
  locationsFilter: string[];
  rechargeBalanceRefreshTimeoutMs: number;
  enableMarsRequestInstrumentation: boolean;
  enableMarsDebugRequestData: boolean;
  enableMarsDebugResponseData: boolean;
}
