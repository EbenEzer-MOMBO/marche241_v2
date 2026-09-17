const AUTH_COOKIE = 'admin_token';
const AUTH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function cookieEstHttps(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

export function persistAuthTokenCookie(token: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = cookieEstHttps() ? '; Secure' : '';
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearAuthTokenCookie(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = cookieEstHttps() ? '; Secure' : '';
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
