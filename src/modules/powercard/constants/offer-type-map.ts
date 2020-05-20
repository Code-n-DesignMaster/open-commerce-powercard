import { OFFER_TYPE } from '@open-commerce/data-objects';
import { mapValues, invert } from 'lodash';

// [
//   OFFER_TYPE.EMAIL,
//   OFFER_TYPE.NEW_USER,
//   OFFER_TYPE.EXISTING_USER,
//   OFFER_TYPE.STORE_ID,
//   OFFER_TYPE.STATE,
//   OFFER_TYPE.CHIP_BALANCE,
//   OFFER_TYPE.TICKET_BALANCE,
//   OFFER_TYPE.APPLE_PAY,
//   OFFER_TYPE.GOOGLE_PAY,
//   ...
// ];
export const offerTypeMap = Object.keys(OFFER_TYPE).filter(
  key => key !== 'NONE',
);

// {
//   EMAIL: 0,
//   NEW_USER: 1,
//   EXISTING_USER: 2,
//   STORE_ID: 3,
//   STATE: 4,
//   CHIP_BALANCE: 5,
//   TICKET_BALANCE: 6,
//   APPLE_PAY: 7,
//   GOOGLE_PAY: 8,
//   ...
// };
export const offerTypeToNumberMap = mapValues(invert(offerTypeMap), v => +v);

// 0	0x0001	1	Email
// 1	0x0002	2	New User
// 2	0x0004	4	Existing User
// 3	0x0008	8	Store ID
// 4	0x0010	16	State
// 5	0x0020	32	Chip Balance
// 6	0x0040	64	Ticket Balance
// 7	0x0080	128	Apple Pay
// 8	0x0100	256	Google Pay
// ...

// {
//   EMAIL: 1,
//   NEW_USER: 2,
//   EXISTING_USER: 4,
//   STORE_ID: 8,
//   STATE: 16,
//   CHIP_BALANCE: 32,
//   TICKET_BALANCE: 64,
//   APPLE_PAY: 128,
//   GOOGLE_PAY: 256,
//   ...
// }
export const offerTypeToBitmaskMap = mapValues(
  offerTypeToNumberMap,
  (value: number) => 2 ** value,
);
