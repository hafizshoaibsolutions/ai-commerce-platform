import { configureStore } from "@reduxjs/toolkit";

import uiReducer from "./slices/ui.slice";

/**
 * A store factory rather than a module-level singleton: in the App Router the
 * server can render the same module for concurrent requests, and a shared store
 * would leak one user's UI state into another's render. `StoreProvider` calls
 * this once per client.
 */
export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
