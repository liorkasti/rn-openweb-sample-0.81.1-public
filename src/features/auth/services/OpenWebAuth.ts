import {OpenWeb} from 'react-native-openweb-sdk';
import type {OWSSOProvider} from 'react-native-openweb-sdk';
import {AuthStatus} from '../types';
import type {AuthState} from '../types';

const TAG = '[AuthService]';

/**
 * Authentication service wrapping the OpenWeb SDK authentication API.
 * @see https://developers.openweb.com/docs/authentication
 */
class AuthService {
  private get auth() {
    return OpenWeb.manager.authentication;
  }

  // ── SSO Handshake Flow ──────────────────────────────────

  async startSSO(): Promise<string> {
    console.log(TAG, 'Starting SSO → generating codeA…');
    const codeA = await this.auth.startSSO();
    console.log(TAG, 'codeA:', codeA);
    return codeA;
  }

  async completeSSO(codeB: string): Promise<string> {
    console.log(TAG, 'Completing SSO with codeB…');
    const userId = await this.auth.completeSSO(codeB);
    console.log(TAG, 'SSO done. userId:', userId);
    return userId;
  }

  // ── Third-Party Provider SSO ────────────────────────────

  async ssoUsingProvider(
    provider: OWSSOProvider,
    token: string,
  ): Promise<string> {
    console.log(TAG, 'SSO via provider:', provider.type);
    const userId = await this.auth.ssoUsingProvider(provider, token);
    console.log(TAG, 'Provider SSO done. userId:', userId);
    return userId;
  }

  // ── Status & Logout ─────────────────────────────────────

  async getUserStatus(): Promise<AuthState> {
    try {
      const status = await this.auth.getUserStatus();
      switch (status.type) {
        case 'ssoLoggedIn':
          return {
            status: AuthStatus.Authenticated,
            userId: status.userId,
            isLoading: false,
          };
        case 'guest':
          return {status: AuthStatus.Guest, isLoading: false};
        default:
          return {status: AuthStatus.Unknown, isLoading: false};
      }
    } catch (error: any) {
      console.warn(TAG, 'getUserStatus error:', error?.message);
      return {status: AuthStatus.Unknown, isLoading: false};
    }
  }

  async logout(): Promise<void> {
    console.log(TAG, 'Logging out…');
    await this.auth.logout();
    console.log(TAG, 'Logged out');
  }

  // ── Event Handlers ──────────────────────────────────────

  onRenewSSO(handler: (userId: string, completion: () => void) => void) {
    return this.auth.onRenewSSO(handler);
  }

  onDisplayAuthenticationFlow(handler: (completion: () => void) => void) {
    return this.auth.onDisplayAuthenticationFlow(handler);
  }

  // ── Login Prompt Control ────────────────────────────────

  set shouldDisplayLoginPrompt(value: boolean) {
    this.auth.shouldDisplayLoginPrompt = value;
  }

  get shouldDisplayLoginPrompt(): boolean {
    return this.auth.shouldDisplayLoginPrompt;
  }
}

export const authService = new AuthService();

// ── SSO API Configuration ───────────────────────────────────
// Hardcoded test user for POC. In production, exchange should happen on your backend.

const SSO_API_BASE = 'https://www.spot.im/api/sso/v1/register-user';
const ACCESS_TOKEN = '03190715DchJcY';
const TEST_USER = {
  primaryKey: 'u_mfs01DpWfsXp',
  userName: 'Test-User',
};

export const exchangeCodeAForCodeB = async (codeA: string): Promise<string> => {
  const url =
    `${SSO_API_BASE}?code_a=${encodeURIComponent(codeA)}` +
    `&access_token=${encodeURIComponent(ACCESS_TOKEN)}` +
    `&primary_key=${encodeURIComponent(TEST_USER.primaryKey)}` +
    `&user_name=${encodeURIComponent(TEST_USER.userName)}`;

  console.log(TAG, '[SSO API] Exchanging codeA for:', TEST_USER.userName);

  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(TAG, '[SSO API] Error:', response.status, errorBody);
    throw new Error(`SSO API error ${response.status}: ${errorBody}`);
  }

  // API returns codeB as raw text
  const codeB = await response.text();
  console.log(TAG, '[SSO API] Got codeB:', codeB.substring(0, 20) + '…');
  return codeB;
};
