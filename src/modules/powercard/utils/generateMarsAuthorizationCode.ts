import { ITransaction } from '@open-commerce/data-objects';

export const generateMarsAuthorizationCode = (
  transaction: ITransaction,
): string => {
  return transaction.paymentProviderTransactionId;
};
