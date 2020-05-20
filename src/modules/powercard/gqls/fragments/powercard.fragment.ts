export const POWERCARD_FRAGMENT = `
  uuid
  isPhysical
  cardNumber
  status
  cardType
  cardAlias
  imagePack{
    uuid
    fullsizeImages{
      url
      width
      height
    }
    thumbnailImages{
      url
      width
      height
    }
  }
  gameChips
  videoChips
  rewardChips
  attractionChips
  tickets
  rewardPoints
  pointsToNextReward
  isRegisteredReward
  easyRechargeEnabled
  walletPass{
    pkPassUrl
    googlePayUrl
  }
`;
