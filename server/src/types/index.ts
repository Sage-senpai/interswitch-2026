import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ISWTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface ISWPaymentRequest {
  amount: number;
  transactionRef: string;
  customerEmail?: string;
  customerId: string;
  currency?: string;
  redirectUrl?: string;
}

export interface ISWPaymentResponse {
  paymentUrl?: string;
  transactionRef: string;
  responseCode: string;
  responseDescription: string;
  amount?: number;
}

export interface ISWBillPaymentRequest {
  paymentCode: string;
  customerId: string;
  customerMobile: string;
  amount: number;
  requestReference: string;
}

export interface ISWTransferRequest {
  bankCode: string;
  accountNumber: string;
  amount: number;
  recipientName: string;
  narration?: string;
  reference: string;
}

export interface ISWRecurringSetup {
  cardToken: string;
  customerId: string;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate?: string;
}
