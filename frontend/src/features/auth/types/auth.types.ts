/**
 * Types mirroring the API's auth contract (backend/src/services/auth.service.ts
 * and backend/src/controllers/auth.controller.ts).
 */

export type UserRole = "customer" | "admin";

/**
 * Trimmed user returned inside `POST /auth/login` and `POST /auth/register`
 * payloads. Note it exposes `id`, not the Mongoose `_id` used by UserProfile.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Full Mongoose document returned by `GET /users/profile`. This is the shape
 * the AuthProvider keeps in state, since it is the one that carries the
 * verification and role fields the UI needs.
 */
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/** Every successful response is wrapped in this envelope. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

/** Error envelope produced by the API's error middleware. */
export interface ApiError {
  success: false;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  user: AuthUser;
  accessToken: string;
  /** False when the account was created but the verification email failed. */
  emailSent: boolean;
}

/**
 * Body of `GET /auth/verify-email/:token`.
 *
 * `alreadyVerified` is true when the link was followed a second time: the
 * address is confirmed either way, but the UI must not claim it just happened.
 */
export interface VerifyEmailResult {
  alreadyVerified: boolean;
}

/**
 * The states `/verify-email/[token]` has to render. The two failure modes are
 * told apart by HTTP status — 410 for an expired link, 400 for one that is
 * malformed or was superseded — because the API's message alone can't say which.
 */
export type VerifyEmailState =
  | "success"
  | "already-verified"
  | "expired"
  | "invalid";

export interface ResendVerificationPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

/**
 * Body for `PATCH /users/profile`. The backend accepts any subset of these but
 * rejects an entirely empty body, so callers must send at least one field.
 */
export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar_url?: string;
}
