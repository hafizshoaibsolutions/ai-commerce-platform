import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Client-only UI state.
 *
 * Deliberately holds nothing the server owns: the user, session and every
 * fetched resource live in TanStack Query. Redux is here for the things React
 * Query has no business storing — where to send someone after they sign in,
 * and a one-shot banner to show once they arrive.
 */
/**
 * How a one-shot notice should read: a confirmation, or something the user
 * needs to act on. Kept deliberately small — it mirrors the two `Alert`
 * variants the banner can render, not the full set.
 */
export type NoticeVariant = "success" | "destructive";

export interface Notice {
  message: string;
  variant: NoticeVariant;
}

export interface UiState {
  /** Path to return to after a successful sign-in, set by the route guards. */
  redirectTo: string | null;
  /** One-shot message rendered once after a redirect, e.g. post-registration. */
  notice: Notice | null;
}

const initialState: UiState = {
  redirectTo: null,
  notice: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setRedirectTo(state, action: PayloadAction<string | null>) {
      state.redirectTo = action.payload;
    },
    clearRedirectTo(state) {
      state.redirectTo = null;
    },
    setNotice(state, action: PayloadAction<Notice>) {
      state.notice = action.payload;
    },
    clearNotice(state) {
      state.notice = null;
    },
  },
});

export const { setRedirectTo, clearRedirectTo, setNotice, clearNotice } =
  uiSlice.actions;

export default uiSlice.reducer;
