import { POWERCARD_FRAGMENT } from './powercard.fragment';

export const TRANSACTION_FRAGMENT = `
uuid
customerId
checkNumber
currency {
    code
    symbol
}
paymentProviderTransactionId
startedAt
completedAt
lastUpdatedAt
status
paymentInfo {
  cardType
  sourceCardType
  hostAuthNumber
  cardCircuit
  cardPANPrint
  preAuthAmount
  hostAuthNumber
}
location {
  uuid
  brandSpecificLocationId
}
items {
    itemType
    itemDescription
    qty
    amount {
      displayPrice
      price
    }
    tax {
      displayPrice
      price
    }
    refundedAmount {
      displayPrice
      price
    }
  }
tax {
  displayPrice
  price
}
authCode
amount {
    price
    displayPrice
}
transactionType
paymentEvents {
  transactionEventType
  paymentInformation
  completedAt
  reasonDescription
  success
}
additionalReceiptData
powercard {
  ${POWERCARD_FRAGMENT}
}
purchaseType
`;
