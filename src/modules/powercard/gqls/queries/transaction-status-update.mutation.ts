import { TRANSACTION_FRAGMENT } from '../fragments/transaction.fragment';
import { TRANSACTION_SERVICE_ERROR } from '../fragments/transaction-service-error';

export const TRANSACTION_STATUS_UPDATE_MUTATION = `mutation transactionStatusUpdate($transactionUuid: ID!,$status: TRANSACTION_STATUS) {
      transactionStatusUpdate(
        transactionUuid: $transactionUuid,
        status: $status
      ) {
        ... on Transaction
        {
          ${TRANSACTION_FRAGMENT}
        }
        ... on TransactionServiceError {
           ${TRANSACTION_SERVICE_ERROR}
        }
      }
    }`;
