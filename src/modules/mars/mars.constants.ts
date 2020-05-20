// Power Card Status
export const CARD_STATUS_DISABLED = 1;
export const CARD_STATUS_INACTIVE = 2;
export const CARD_STATUS_OPEN = 3;
export const CARD_STATUS_STOLEN = 4;
export const CARD_STATUS_VIP = 5;
export const CARD_STATUS_VOID = 6;

// Credit Card Types
export const CARD_TYPE_UNKNOWN = 0;
export const CARD_TYPE_AMEX = 1;
export const CARD_TYPE_VISA = 2;
export const CARD_TYPE_MASTERCARD = 3;
export const CARD_TYPE_DISCOVER = 4;
export const CARD_TYPE_CARTE_BLANC = 5;
export const CARD_TYPE_DINERS_CLUB = 6;
export const CARD_TYPE_JCB = 7;
export const CARD_TYPE_APPLE_PAY = 8;
export const CARD_TYPE_PAYPAL = 9;
export const CARD_TYPE_VENMO = 10;

// Countries
export const UNITED_STATUS = 'USA';
export const CANADA = 'CAN';

// Rewards History Types
export const REWARDS_HISTORY_POINTS_EARNED = 1;
export const REWARDS_HISTORY_CHIPS_EARNED = 2;
export const REWARDS_HISTORY_CHIPS_EXPIRED = 3;

export const MARS_API_TOKEN = 'MARS_API_TOKEN';

// Credit Card Types defined in MARS API Spec
// 0 – Unknown
// 1 – Amex
// 2 – Visa
// 3 – MasterCard
// 4 – Discover
// 5 – CarteBlanc
// 6 – DinersClub
// 7 – JCB
// 8 – Apple Pay
// 9 – Google Pay
// 10 – PayPal
// 11 – Venmo
export const paymentInstrumentTypeMap = {
  AMAZON_PAY: 0,
  AMERICAN_EXPRESS: 1,
  APPLE_PAY: 8,
  CARTES_BANCAIRES: 0,
  CHASE_PAY: 0,
  CHINA_UNION_PAY: 0,
  CITI_PAY: 0,
  CREDIT: 0,
  DEBIT: 0,
  DISCOVER: 4,
  EFTPOS: 0,
  GIFT: 0,
  GOOGLE_WALLET: 9,
  GOOGLE_PAY: 9,
  ID_CREDIT: 0,
  INTERAC: 0,
  JCB: 7,
  MAESTRO: 0,
  MASTERCARD: 3,
  MASTERPASS: 0,
  PAYPAL: 10,
  PREPAID: 0,
  PRIVATE_LABEL: 0,
  QUIC_PAY: 0,
  SUICA: 0,
  VENMO: 11,
  VISA: 2,
  VISA_CHECKOUT: 0,
  VISA_VPAY: 0,
};
