export interface IPowercardBalancesServiceConfig {
  powercardChipsRechargeAlertThreshold: number;
  powercardBalanceRoutingKey: string;
  powercardTicketUpdateRoutingKey: string;
  powercardTicketUpdateSessionTimeoutSecondsLength: number;
  easyRechargeNotificationTitleCopy: string;
  easyRechargeNotificationBodyCopy: string;
  easyRechargeDeepLinkUrlPrefix: string;
  dontEnablePowercardBalanceListener: boolean;
}
