import axios, { AxiosInstance, AxiosError } from 'axios';
import { iswConfig } from '../../config/interswitch';
import { redis } from '../../config/database';
import { encodeCredentials, generateTimestamp } from '../../utils/crypto';
import { ISWTokenResponse } from '../../types';

/**
 * Base Interswitch service — handles authentication and shared HTTP client.
 * All payment sub-services extend this.
 */
export class InterswitchBase {
  protected client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: iswConfig.baseUrl,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  }

  /**
   * Get OAuth2 access token (client credentials grant).
   * Cached in Redis for the duration of token validity.
   */
  async getAccessToken(): Promise<string> {
    // Check cache first (Redis may be unavailable)
    try {
      const cached = await redis.get('isw:access_token');
      if (cached) return cached;
    } catch {
      // Redis unavailable — proceed without cache
    }

    try {
      const response = await this.client.post<ISWTokenResponse>(
        iswConfig.endpoints.token,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${encodeCredentials(iswConfig.clientId, iswConfig.secretKey)}`,
          },
        },
      );

      const { access_token, expires_in } = response.data;

      // Cache token (ignore Redis errors)
      try {
        await redis.setex('isw:access_token', expires_in - 60, access_token);
      } catch {}

      return access_token;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Interswitch auth failed:', axiosError.response?.data || axiosError.message);
      throw new Error('Failed to authenticate with Interswitch');
    }
  }

  /**
   * Get standard auth headers for Interswitch API calls.
   */
  protected async getAuthHeaders() {
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      Timestamp: generateTimestamp(),
    };
  }

  /**
   * Make an authenticated GET request to Interswitch.
   */
  protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await this.client.get<T>(endpoint, { headers, params });
    return response.data;
  }

  /**
   * Make an authenticated POST request to Interswitch.
   */
  protected async post<T>(endpoint: string, data: unknown, extraHeaders?: Record<string, string>): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await this.client.post<T>(endpoint, data, {
      headers: { ...headers, ...extraHeaders },
    });
    return response.data;
  }
}
