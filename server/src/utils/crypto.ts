import crypto from 'crypto';

/**
 * Generate Interswitch MAC hash (SHA-512).
 * Used for authenticating IPG and payment API requests.
 */
export function generateMAC(...values: string[]): string {
  const data = values.join('');
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * Generate a unique transaction reference.
 * Format: PURSE-{timestamp}-{random hex}
 */
export function generateReference(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `PURSE-${timestamp}-${random}`;
}

/**
 * Generate ISO timestamp for Interswitch API headers.
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate Base64-encoded credentials for Interswitch OAuth.
 */
export function encodeCredentials(clientId: string, secretKey: string): string {
  return Buffer.from(`${clientId}:${secretKey}`).toString('base64');
}

/**
 * Hash a value with SHA-256 (general purpose).
 */
export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}
