import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./store";

/**
 * Pre-typed Redux hooks. Always import these instead of the raw react-redux
 * ones so state and thunks stay fully inferred.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
