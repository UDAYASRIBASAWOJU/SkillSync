import axios from 'axios';
import { store } from '../store';
import { logout, setCredentials } from '../store/slices/authSlice';

// Dynamically detect the correct API domain based on the frontend domain.
// This allows both domains (skillsync.mraks.dev and skillsync.udayasri.dev)
// to use the same built code while avoiding third-party cookie blocking issues.
const getApiBaseUrl = () => {
  const isProd = import.meta.env.PROD;
  if (!isProd) return import.meta.env.VITE_API_URL || 'http://localhost:8080';

  let currentHost = '';
  if (typeof window !== 'undefined') {
    currentHost = window.location.hostname;
  }

  // DYNAMIC MAPPING:
  // skillsync.udayasri.dev -> api.skillsync.udayasri.dev
  // skillsync.mraks.dev -> api.skillsync.mraks.dev
  if (currentHost.includes('skillsync.udayasri.dev')) {
    return 'https://api.skillsync.udayasri.dev';
  } else if (currentHost.includes('skillsync.mraks.dev')) {
    return 'https://api.skillsync.mraks.dev';
  }

  // Fallback to Vercel env var if neither domain matched
  let fallbackUrl = import.meta.env.VITE_API_URL;
  if (fallbackUrl && fallbackUrl.includes('35.153.59.2')) {
    return 'https://api.skillsync.udayasri.dev';
  }
  return fallbackUrl || 'https://api.skillsync.udayasri.dev';
};

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST INTERCEPTOR — we no longer manually attach the token.
// The browser will automatically send the HttpOnly 'accessToken' cookie.
api.interceptors.request.use((config) => {
  return config;
});

// RESPONSE INTERCEPTOR — handle 401 with silent token refresh + retry
let isRefreshing = false;
let lastRefreshAttemptTime = 0;
const REFRESH_COOLDOWN_MS = 10_000; // Prevent hammering refresh within 10 seconds
let failedQueue: Array<{ resolve: () => void; reject: (err: any) => void }> = [];

const isInvalidSessionStatus = (status?: number): boolean => status === 401 || status === 403;

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint = typeof requestUrl === 'string' && requestUrl.startsWith('/api/auth/');

    // Allow callers to handle unauthenticated states without global redirects.
    // Also never force refresh/redirect for auth endpoints (login/register/etc.).
    if (error.response?.status === 401 && (originalRequest._skipAuthRedirect || isAuthEndpoint)) {
      return Promise.reject(error);
    }

    // Skip refresh loop for the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
      originalRequest._retry = true;

      // Cooldown guard: if we just attempted a refresh recently and it failed,
      // don't spam the server again — go straight to logout.
      const now = Date.now();
      if (now - lastRefreshAttemptTime < REFRESH_COOLDOWN_MS && !isRefreshing) {
        console.warn('[Auth] Refresh cooldown active — skipping duplicate refresh attempt.');
        store.dispatch(logout());
        window.location.href = '/login?reason=session_expired';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          if (originalRequest.headers) {
            delete originalRequest.headers.Authorization;
          }
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      lastRefreshAttemptTime = now;

      try {
        const currentRefreshToken = store.getState().auth.refreshToken;

        const refreshResponse = await api.post(
          '/api/auth/refresh',
          currentRefreshToken ? { refreshToken: currentRefreshToken } : undefined,
          {
            _skipErrorRedirect: true,
            _skipAuthRedirect: true,
          } as any,
        );

        const refreshed = refreshResponse?.data;
        if (refreshed?.user) {
          store.dispatch(
            setCredentials({
              user: refreshed.user,
              accessToken: refreshed.accessToken || '',
              refreshToken: refreshed.refreshToken || currentRefreshToken || '',
            }),
          );
        }

        // Refresh was successful. Tokens are cookie-based, so queued requests
        // should be replayed without forcing an Authorization header.
        processQueue(null);
        
        // Re-run original request without altering authorization header
        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        const refreshStatus = (refreshError as any)?.response?.status;

        // Only force logout when the refresh token is definitely invalid/expired.
        if (isInvalidSessionStatus(refreshStatus)) {
          try {
            // Multi-tab or timing races can briefly fail refresh while a valid cookie session still exists.
            const meResponse = await api.get('/api/auth/me', {
              _skipErrorRedirect: true,
              _skipAuthRedirect: true,
            } as any);

            if (meResponse?.data) {
              const currentRefreshToken = store.getState().auth.refreshToken;
              store.dispatch(setCredentials({
                user: meResponse.data,
                accessToken: store.getState().auth.accessToken || '',
                refreshToken: currentRefreshToken || '',
              }));

              if (originalRequest.headers) {
                delete originalRequest.headers.Authorization;
              }
              return api(originalRequest);
            }
          } catch {
            // Fall through to forced logout only when sanity check also fails.
          }

          store.dispatch(logout());
          window.location.href = '/login?reason=session_expired';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 — role forbidden
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
    }

    // 500 — server error fallback message (skip if caller opted out)
    if (error.response?.status >= 500 && error.response?.status !== 503 && !originalRequest._skipErrorRedirect) {
      window.location.href = '/500';
    }

    // 429 / 503 — exponential backoff retry (max 3 times)
    // CRITICAL: Never auto-retry the refresh endpoint — this was causing the 429 storm.
    const retryCount = originalRequest._retryCount || 0;
    const isRefreshUrl = originalRequest.url === '/api/auth/refresh';
    if ([429, 503].includes(error.response?.status) && retryCount < 3 && !isRefreshUrl) {
      originalRequest._retryCount = retryCount + 1;
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise((res) => setTimeout(res, delay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;
