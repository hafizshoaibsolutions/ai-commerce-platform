import { api } from "@/lib/axios";

import type {
  ApiSuccess,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResult,
  RegisterPayload,
  RegisterResult,
  ResendVerificationPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UserProfile,
  VerifyEmailResult,
} from "../types/auth.types";

/**
 * Auth endpoints.
 *
 * The access token these calls return is handed to the AuthProvider via
 * `setAccessToken`; the refresh token is never visible here because the API
 * sets it as an httpOnly cookie.
 *
 * Token refresh itself lives in `@/lib/axios`, not here — the axios 401
 * interceptor needs it, and importing it from this module would create a cycle.
 */
export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    const { data } = await api.post<ApiSuccess<LoginResult>>(
      "/auth/login",
      payload,
    );

    return data.data;
  },

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    const { data } = await api.post<ApiSuccess<RegisterResult>>(
      "/auth/register",
      payload,
    );

    return data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  /**
   * Fetches the signed-in user. Requires a valid access token, so callers only
   * enable it once the session has been established.
   */
  async getCurrentUser(): Promise<UserProfile> {
    const { data } = await api.get<ApiSuccess<{ user: UserProfile }>>(
      "/users/profile",
    );

    return data.data.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const { data } = await api.patch<ApiSuccess<{ user: UserProfile }>>(
      "/users/profile",
      payload,
    );

    return data.data.user;
  },

  /** Always resolves 200, even for unknown emails — the API never reveals that. */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await api.post("/auth/forgot-password", payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await api.post("/auth/reset-password", payload);
  },

  async verifyEmail(token: string): Promise<VerifyEmailResult> {
    const { data } = await api.get<ApiSuccess<VerifyEmailResult>>(
      `/auth/verify-email/${token}`,
    );

    return data.data;
  },

  /**
   * Asks for a fresh verification link.
   *
   * Always resolves 200, even for an unknown or already-verified address — the
   * API never reveals which emails have accounts, so callers must not word
   * their confirmation as "we definitely sent it".
   */
  async resendVerification(payload: ResendVerificationPayload): Promise<void> {
    await api.post("/auth/resend-verification", payload);
  },
};
