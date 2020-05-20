import { POWERCARD_STATUS_TYPE } from '@open-commerce/data-objects';

export const powercardStatusMap = [
  null,
  POWERCARD_STATUS_TYPE.DISABLED,
  POWERCARD_STATUS_TYPE.INACTIVE,
  POWERCARD_STATUS_TYPE.OPEN,
  POWERCARD_STATUS_TYPE.STOLEN,
  POWERCARD_STATUS_TYPE.VIP,
  POWERCARD_STATUS_TYPE.VOID,
];
