import { prisma } from '../../config/database';
import { iswConfig } from '../../config/interswitch';
import { generateMAC, generateReference } from '../../utils/crypto';
import { AppError } from '../../middleware/errorHandler';
import { InterswitchBase } from './interswitch.service';

interface IPGInitiateResponse {
  paymentUrl: string;
  transactionRef: string;
  merchantCode: string;
}

interface IPGCallbackPayload {
  resp: string;
  txnref: string;
  payRef?: string;
  retRef?: string;
  cardNum?: string;
  apprAmt?: string;
  amount?: string;
}

/**
 * Interswitch Payment Gateway (IPG) — card collections and wallet funding.
 */
export class IPGService extends InterswitchBase {
  /**
   * Initiate a card payment for wallet funding.
   * Returns a payment URL to redirect the user to Interswitch's hosted page.
   */
  async initiatePayment(userId: string, amount: number) {
    if (amount < 100) {
      throw new AppError(400, 'MIN_AMOUNT', 'Minimum funding amount is ₦100');
    }

    const reference = generateReference();
    const amountInKobo = Math.round(amount * 100).toString();

    // Generate MAC hash: transactionRef + clientId + amount
    const mac = generateMAC(reference, iswConfig.clientId, amountInKobo);

    // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'WALLET_FUNDING',
        amount,
        reference,
        status: 'PENDING',
        description: `Wallet funding - ₦${amount.toLocaleString()}`,
        metadata: { amountInKobo, mac },
      },
    });

    // Build IPG payment data for Interswitch inline checkout
    const paymentData = {
      merchant_code: iswConfig.merchantCode,
      pay_item_id: iswConfig.payItemId,
      txn_ref: reference,
      amount: amountInKobo,
      currency: parseInt(iswConfig.currencyCode),
      cust_id: userId,
      site_redirect_url: iswConfig.callbackUrl,
      hash: mac,
      mode: 'TEST',
    };

    return {
      paymentUrl: iswConfig.inlineCheckoutUrl,
      transactionRef: reference,
      transactionId: transaction.id,
      paymentData,
      // Client uses these to call webpayCheckout()
      checkoutConfig: {
        merchant_code: iswConfig.merchantCode,
        pay_item_id: iswConfig.payItemId,
        txn_ref: reference,
        amount: parseInt(amountInKobo),
        currency: parseInt(iswConfig.currencyCode),
        cust_id: userId,
        site_redirect_url: iswConfig.callbackUrl,
        mode: 'TEST',
      },
    };
  }

  /**
   * Handle Interswitch payment callback.
   * Called when user completes payment on Interswitch's page.
   */
  async handleCallback(payload: IPGCallbackPayload) {
    const { resp, txnref, payRef, apprAmt } = payload;

    const transaction = await prisma.transaction.findUnique({
      where: { reference: txnref },
    });

    if (!transaction) {
      throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction reference not found');
    }

    if (transaction.status !== 'PENDING') {
      return { message: 'Transaction already processed', status: transaction.status };
    }

    // Response code "00" means success in Interswitch
    const isSuccess = resp === '00';

    if (isSuccess) {
      // Credit wallet and update transaction in a single DB transaction
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'SUCCESS',
            iswRef: payRef,
            metadata: { ...transaction.metadata as object, resp, apprAmt },
          },
        }),
        prisma.wallet.update({
          where: { userId: transaction.userId },
          data: { balance: { increment: transaction.amount } },
        }),
      ]);

      return { message: 'Payment successful', status: 'SUCCESS', amount: transaction.amount };
    }

    // Payment failed
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'FAILED',
        metadata: { ...transaction.metadata as object, resp, failReason: 'Payment declined' },
      },
    });

    return { message: 'Payment failed', status: 'FAILED' };
  }

  /**
   * Query payment status from Interswitch.
   */
  async queryPaymentStatus(reference: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      throw new AppError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
    }

    // Query Interswitch for real-time status
    try {
      const amountInKobo = Math.round(Number(transaction.amount) * 100).toString();
      const response = await this.get<{ ResponseCode: string; ResponseDescription: string }>(
        iswConfig.endpoints.paymentStatus,
        { merchantcode: iswConfig.merchantCode, transactionreference: reference, amount: amountInKobo },
      );

      return {
        reference: transaction.reference,
        amount: transaction.amount,
        localStatus: transaction.status,
        iswStatus: response.ResponseCode === '00' ? 'SUCCESS' : 'PENDING',
        iswDescription: response.ResponseDescription,
      };
    } catch {
      // If ISW query fails, return local status
      return {
        reference: transaction.reference,
        amount: transaction.amount,
        localStatus: transaction.status,
        iswStatus: 'UNKNOWN',
      };
    }
  }
}

export const ipgService = new IPGService();
