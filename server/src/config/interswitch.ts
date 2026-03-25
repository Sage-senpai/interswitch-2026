import { env } from './env';

export const iswConfig = {
  clientId: env.ISW_CLIENT_ID,
  secretKey: env.ISW_SECRET_KEY,
  passphrase: env.ISW_PASSPHRASE || '',
  merchantCode: env.ISW_MERCHANT_CODE || 'MX6072',
  payItemId: env.ISW_PAY_ITEM_ID || '9405967',
  baseUrl: env.ISW_BASE_URL,

  endpoints: {
    // OAuth2
    token: '/passport/oauth/token',

    // IPG — Collections & Wallet Funding
    purchase: '/api/v2/purchases',
    paymentStatus: '/collections/api/v1/gettransaction.json',

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

  // Inline checkout JS (sandbox)
  inlineCheckoutUrl: env.ISW_BASE_URL === 'https://qa.interswitchng.com'
    ? 'https://newwebpay.qa.interswitchng.com/inline-checkout.js'
    : 'https://newwebpay.interswitchng.com/inline-checkout.js',

  // Currency code for Nigerian Naira
  currencyCode: '566',

  // Callback URL
  callbackUrl: env.NODE_ENV === 'production'
    ? 'https://interswitch-2026-production.up.railway.app/api/v1/payments/callback'
    : 'http://localhost:3000/api/v1/payments/callback',
};
