import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

if (!BASE_URL) {
  console.error(
    "[api] NEXT_PUBLIC_BASE_API_URL is not set. Client requests will hit the " +
      "Next.js server instead of the API. Add it to .env.local and restart dev.",
  );
}

/**
 * The access token is kept in memory only — never localStorage — because the
 * API already holds the refresh token in an httpOnly cookie. On reload the
 * cookie is silently exchanged for a new access token (see AuthProvider).
 *
 * This module owns the token so the axios interceptors can read and rotate it
 * without importing React code.
 */
let accessToken: string | null = null;

/** Called when a refresh fails, so the provider can drop the session. */
let onSessionExpired: (() => void) | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the refreshToken cookie
});

/**
 * Bare instance for the refresh call itself. It must not run through the 401
 * interceptor below, otherwise a rejected refresh would recurse forever.
 */
const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/** Auth endpoints must never trigger a refresh attempt. */
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
];

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  success: boolean;
  data: { accessToken: string };
}

let refreshPromise: Promise<string> | null = null;

/**
 * Exchanges the httpOnly `refreshToken` cookie for a fresh access token.
 *
 * Concurrent callers share a single in-flight request: the API rate-limits
 * `/auth/refresh-token` to 10 attempts per 15 minutes, so a burst of parallel
 * 401s must not each spend one.
 */
export const refreshAccessToken = (): Promise<string> => {
  refreshPromise ??= (async () => {
    try {
      const { data } = await refreshApi.post<RefreshResponse>(
        "/auth/refresh-token",
      );

      const token = data.data.accessToken;
      accessToken = token;

      return token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequestConfig | undefined;
    const isUnauthorized = error.response?.status === 401;
    const requestUrl = original?.url ?? "";
    const isNoRefreshPath = NO_REFRESH_PATHS.some((path) =>
      requestUrl.includes(path),
    );

    // Only a 401 on a retryable, token-bearing endpoint is recoverable.
    if (
      !isUnauthorized ||
      !original ||
      original._retry ||
      isNoRefreshPath ||
      !accessToken
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers.set("Authorization", `Bearer ${token}`);

      return api(original);
    } catch {
      // Refresh failed: the refresh cookie is gone or revoked. End the session
      // and surface the original 401 to the caller.
      onSessionExpired?.();

      return Promise.reject(error);
    }
  },
);

/** HTTP status of a failed request, or undefined when it never reached the API. */
export const getApiErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/**
 * Error shape returned by the API's error middleware (and its rate limiters).
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;

    if (message) return message;

    if (error.code === "ERR_NETWORK") {
      return "Cannot reach the server. Check your connection and try again.";
    }
  }

  return fallback;
};
