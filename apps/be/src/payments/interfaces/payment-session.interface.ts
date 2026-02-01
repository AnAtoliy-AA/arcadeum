export interface PaymentSession {
  transactionId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
}
