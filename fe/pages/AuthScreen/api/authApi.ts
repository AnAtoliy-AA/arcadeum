import { authorize, AuthorizeResult, revoke } from 'react-native-app-auth';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { authConfig } from '../config/authConfig';

function validateConfig() {
  const missing: string[] = [];
  if (!authConfig.clientId) missing.push('clientId');
  if (!authConfig.redirectUrl) missing.push('redirectUrl');
  if (!authConfig.issuer) missing.push('issuer');
  if (missing.length) {
    throw new Error(
      `Missing OAuth config for ${Platform.OS}. Missing: ${missing.join(', ')}. Check your .env and app.config.ts.`
    );
  }
}

function logDevConfig(label: string) {
  if (!__DEV__) return;
  // Safe to log in dev; avoid secrets
  // Shows high-level config only
  // Do not log tokens
  console.debug(`${label} OAuth config`, {
    clientId: authConfig.clientId,
    redirectUrl: authConfig.redirectUrl,
    issuer: authConfig.issuer,
    scopes: authConfig.scopes,
  });
}

async function startWebAuth(): Promise<AuthorizeResult> {
  const discovery = await AuthSession.fetchDiscoveryAsync(authConfig.issuer);
  const request = new AuthSession.AuthRequest({
    clientId: authConfig.clientId!,
    redirectUri: authConfig.redirectUrl!,
    scopes: authConfig.scopes,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });
  const authUrl = await request.makeAuthUrlAsync(discovery);
  try {
    sessionStorage.setItem('oauth_code_verifier', request.codeVerifier || '');
    sessionStorage.setItem('oauth_state', request.state || '');
  } catch {}
  window.location.assign(authUrl);
  // Navigation will unload the page; return a pending promise to satisfy typing.
  return new Promise<AuthorizeResult>(() => {});
}

export async function loginWithOAuth(): Promise<AuthorizeResult> {
  validateConfig();

  if (Platform.OS === 'web') {
    logDevConfig('Web');
    return startWebAuth();
  }

  if (Platform.OS === 'android') logDevConfig('Android');
  if (Platform.OS === 'ios') logDevConfig('iOS');

  try {
    return await authorize(authConfig);
  } catch (e: any) {
    const message = e?.message || String(e);
    console.error(`[${Platform.OS}] OAuth authorize failed:`, message);
    throw e;
  }
}

export async function logoutOAuth(params: { accessToken?: string; refreshToken?: string }) {
  const { accessToken, refreshToken } = params;

  try {
    if (Platform.OS === 'web') {
      if (!accessToken) return; // nothing to revoke client-side
      const discovery = await AuthSession.fetchDiscoveryAsync(authConfig.issuer);
      if (discovery.revocationEndpoint) {
        await AuthSession.revokeAsync({ token: accessToken, clientId: authConfig.clientId! }, discovery);
      }
      return;
    }

    // Native (Android/iOS) — revoke access and refresh tokens if present
    if (accessToken) {
      await revoke(authConfig as any, { tokenToRevoke: accessToken, sendClientId: true });
    }
    if (refreshToken) {
      await revoke(authConfig as any, { tokenToRevoke: refreshToken, sendClientId: true });
    }
  } catch (e: any) {
    const message = e?.message || String(e);
    console.warn(`[${Platform.OS}] OAuth revoke failed:`, message);
  }
}
