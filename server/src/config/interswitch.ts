import { env } from './env';

export const iswConfig = {
  clientId: env.ISW_CLIENT_ID,
  secretKey: env.ISW_SECRET_KEY,
  passphrase: env.ISW_PASSPHRASE || '',
  baseUrl: env.ISW_BASE_URL,

  endpoints: {
    // OAuth2
    token: '/passport/oauth/token',

    // IPG — Collections & Wallet Funding
    purchase: '/api/v2/purchases',
    paymentStatus: '/api/v2/purchases',

    // Quickteller — Bills
    billerCategories: '/api/v2/quickteller/categorys',
    billers: '/api/v2/quickteller/billers',
    billPayment: '/api/v2/quickteller/payments/advices',
    billValidate: '/api/v2/quickteller/customers/validations',

    // Quickteller — Transfers
    transfer: '/api/v2/quickteller/transfers',
    bankCodes: '/api/v2/quickteller/banks',
    nameEnquiry: '/api/v2/quickteller/transfers/nameenquiry',

    // Recurring / AutoPay
    recurringSetup: '/api/v2/recurring/setup',
    recurringCharge: '/api/v2/recurring/charge',
    recurringCancel: '/api/v2/recurring/cancel',
  },

  // Currency code for Nigerian Naira
  currencyCode: '566',

  // Callback URLs (set per environment)
  callbackUrl: env.NODE_ENV === 'production'
    ? 'https://api.purse-app.com/api/v1/payments/callback'
    : 'http://localhost:3000/api/v1/payments/callback',
};
