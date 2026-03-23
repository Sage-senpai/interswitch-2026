import { prisma } from '../../config/database';
import { iswConfig } from '../../config/interswitch';
import { generateReference } from '../../utils/crypto';
import { AppError } from '../../middleware/errorHandler';
import { InterswitchBase } from './interswitch.service';
import { ISWBillPaymentRequest, ISWTransferRequest } from '../../types';

interface BillerCategory {
  id: string;
  name: string;
  description: string;
}

interface Biller {
  billerId: string;
  billerName: string;
  categoryId: string;
  paymentCode: string;
}

interface NameEnquiryResponse {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

/**
 * Quickteller service — bills payment and P2P transfers.
 */
export class QuicktellerService extends InterswitchBase {
  // ─── Bills Payment ──────────────────────────────────────

  /**
   * Get available biller categories (airtime, electricity, etc.)
   */
  async getBillerCategories(): Promise<BillerCategory[]> {
    const response = await this.get<{ categorys: BillerCategory[] }>(
      iswConfig.endpoints.billerCategories,
    );
    return response.categorys || [];
  }

  /**
   * Get billers under a specific category.
   */
  async getBillers(categoryId: string): Promise<Biller[]> {
    const response = await this.get<{ billers: Biller[] }>(
      iswConfig.endpoints.billers,
      { categoryId },
    );
    return response.billers || [];
  }

  /**
   * Validate a customer ID for a biller (e.g., meter number, smart card).
   */
  async validateCustomer(paymentCode: string, customerId: string) {
    const response = await this.post<{ responseCode: string; fullName: string }>(
      iswConfig.endpoints.billValidate,
      {
        customers: [{
          PaymentCode: paymentCode,
          CustomerId: customerId,
        }],
      },
    );
    return response;
  }

  /**
   * Pay a bill (airtime, electricity, school fees, etc.)
   * Deducts from user's wallet and sends payment via Quickteller.
   */
  async payBill(userId: string, data: ISWBillPaymentRequest) {
    const { paymentCode, customerId, customerMobile, amount } = data;

    // Verify wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.balance) < amount) {
      throw new AppError(400, 'INSUFFICIENT_BALANCE', 'Wallet balance is insufficient');
    }

    const reference = generateReference();
    const amountInKobo = Math.round(amount * 100);

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'BILL_PAYMENT',
        amount,
        reference,
        status: 'PENDING',
        description: `Bill payment - ₦${amount.toLocaleString()}`,
      },
    });

    try {
      // Send to Interswitch Quickteller
      const response = await this.post<{ ResponseCode: string; ResponseCodeGrouping: string }>(
        iswConfig.endpoints.billPayment,
        {
          TerminalId: '3PBL0001',
          paymentCode,
          customerId,
          customerMobile,
          amount: amountInKobo,
          requestReference: reference,
        },
      );

      const isSuccess = response.ResponseCode === '00' || response.ResponseCodeGrouping === 'SUCCESSFUL';

      if (isSuccess) {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'SUCCESS', iswRef: reference },
          }),
          prisma.wallet.update({
            where: { userId },
            data: { balance: { decrement: amount } },
          }),
        ]);

        return {
          success: true,
          reference,
          transactionId: transaction.id,
          message: 'Bill payment successful',
        };
      }

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      throw new AppError(400, 'PAYMENT_FAILED', 'Bill payment was declined');

    } catch (error) {
      if (error instanceof AppError) throw error;

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      throw new AppError(502, 'ISW_ERROR', 'Payment processing failed. Please try again.');
    }
  }

  // ─── P2P Transfers ──────────────────────────────────────

  /**
   * Get list of supported banks.
   */
  async getBanks() {
    const response = await this.get<{ banks: { bankCode: string; bankName: string }[] }>(
      iswConfig.endpoints.bankCodes,
    );
    return response.banks || [];
  }

  /**
   * Look up account name before transfer.
   */
  async nameEnquiry(bankCode: string, accountNumber: string): Promise<NameEnquiryResponse> {
    const response = await this.post<NameEnquiryResponse>(
      iswConfig.endpoints.nameEnquiry,
      { bankCode, accountNumber },
    );
    return response;
  }

  /**
   * Send money to a bank account via Quickteller Transfers.
   */
  async sendMoney(userId: string, data: ISWTransferRequest) {
    const { bankCode, accountNumber, amount, recipientName, narration } = data;

    if (amount < 50) {
      throw new AppError(400, 'MIN_AMOUNT', 'Minimum transfer amount is ₦50');
    }

    // Verify wallet balance (include ₦25 transfer fee)
    const transferFee = 25;
    const totalDebit = amount + transferFee;
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.balance) < totalDebit) {
      throw new AppError(400, 'INSUFFICIENT_BALANCE', `Insufficient balance. You need ₦${totalDebit} (includes ₦${transferFee} fee)`);
    }

    const reference = generateReference();

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'P2P_TRANSFER',
        amount,
        reference,
        status: 'PENDING',
        description: `Transfer to ${recipientName} - ₦${amount.toLocaleString()}`,
        metadata: { bankCode, accountNumber, recipientName, fee: transferFee },
      },
    });

    try {
      const response = await this.post<{ ResponseCode: string; ResponseDescription: string }>(
        iswConfig.endpoints.transfer,
        {
          bankCode,
          accountNumber,
          amount: Math.round(amount * 100),
          accountName: recipientName,
          narration: narration || `Purse transfer from ${userId.slice(0, 8)}`,
          requestReference: reference,
        },
      );

      const isSuccess = response.ResponseCode === '00';

      if (isSuccess) {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'SUCCESS', iswRef: reference },
          }),
          prisma.wallet.update({
            where: { userId },
            data: { balance: { decrement: totalDebit } },
          }),
        ]);

        return {
          success: true,
          reference,
          transactionId: transaction.id,
          amount,
          fee: transferFee,
          recipient: recipientName,
          message: 'Transfer successful',
        };
      }

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      throw new AppError(400, 'TRANSFER_FAILED', response.ResponseDescription || 'Transfer was declined');

    } catch (error) {
      if (error instanceof AppError) throw error;

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      throw new AppError(502, 'ISW_ERROR', 'Transfer processing failed. Please try again.');
    }
  }
}

export const quicktellerService = new QuicktellerService();
