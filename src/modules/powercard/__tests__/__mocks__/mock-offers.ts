export const mockOfferFromMars = {
  OfferID: 4,
  OfferType: 1, // <------- We need to set this inside the test
  TermsAndConditions:
    // tslint:disable-next-line: max-line-length
    '*Promotional. EXPIRES: 11/5/2019. Limit one coupon per customer per Power Card®. Limited to in-app redemption only, not valid for in store redemption. Coupon value may not be divided into multiple Power Cards. Coupon valid for one use only. Minor policies vary by location – please check daveandbusters.com for details. Not valid with any other offers, including Eat & Play Combos, Half Price Games Wednesdays or any Half Price Game promotion. Not valid with Special Events Packages or on Virtual Reality games. NOT FOR RESALE.',
  ValidFrom: '2019-10-25T00:00:00',
  ValidTo: '2019-11-05T00:00:00',
  ImageUrl:
    'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_Mobile+App_Offer+Images_2XChips_V4.jpg',
  AutoApply: true,
  Title: '2X Chips with $25 Power Card® Recharge',
  Description:
    'Get 2X Chips with $25 In-App Power Card® Recharge through 11/5/2019.',
  Item: {
    NumberOfMinutes: 0,
    Color: '#000000',
    Price: 25,
    CategoryID: 0,
    UpSellID: 0,
    IsBestValue: false,
    OriginalPrice: 25,
    NumberOfChips: 270,
    Sequence: 0,
    ItemID: 66,
  },
  OfferAmount: 25,
  Disclaimer: '',
};
