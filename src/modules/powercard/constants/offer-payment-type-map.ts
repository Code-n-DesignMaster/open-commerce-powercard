import { OFFER_PAYMENT_TYPE } from '@open-commerce/data-objects';
import { mapValues, invert } from 'lodash';

// This one-liner generates the following map:
// [
//   OFFER_PAYMENT_TYPE.NONE,
//   OFFER_PAYMENT_TYPE.APPLE_PAY,
//   OFFER_PAYMENT_TYPE.GOOGLE_PAY,
//   ...
// ];
// This code does not need to be modified as new enum values are added.
export const offerPaymentTypeMap = Object.keys(OFFER_PAYMENT_TYPE);

// These lodash functions generate the following map:
// {
//   NONE: 0,
//   APPLE_PAY: 1,
//   GOOGLE_PAY: 2,
//   ...
// };
// This code does not need to be modified as new enum values are added.
export const offerPaymentTypeToNumberMap = mapValues(
  invert(offerPaymentTypeMap),
  v => +v,
);
