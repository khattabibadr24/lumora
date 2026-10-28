export const COOKIE_NAME = "app_session_id";
export const LOCAL_ADMIN_COOKIE_NAME = "lumora_admin_session";
export const LOCAL_ADMIN_EMAIL = "admin@lumora.ma";
export const LOCAL_ADMIN_EMAIL_ALIASES = [LOCAL_ADMIN_EMAIL, "admin@lumora.com"] as const;
export const LOCAL_ADMIN_PASSWORD = "lumora2026";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
export const OAUTH_STATE_COOKIE = "__Host-oauth_state";

export type OAuthState = { redirectUri: string; nonce?: string };

export const encodeOAuthState = (state: OAuthState): string => btoa(JSON.stringify(state));

export const decodeOAuthState = (state: string): OAuthState => {
  try {
    const decoded = atob(state);
    const parsed = JSON.parse(decoded) as Partial<OAuthState>;
    if (parsed && typeof parsed.redirectUri === "string") return parsed as OAuthState;
    return { redirectUri: decoded };
  } catch {
    return { redirectUri: "" };
  }
};
