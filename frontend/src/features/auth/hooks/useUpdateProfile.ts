"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "../services/auth.api";
import { authKeys } from "../services/auth.keys";
import type {
  UpdateProfilePayload,
  UserProfile,
} from "../types/auth.types";

/**
 * Updates the signed-in user's profile.
 *
 * `PATCH /users/profile` responds with the updated document, so the response is
 * written straight into the cache — the UI reflects the change without a second
 * round-trip. One source of truth, no duplicated user object.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, unknown, UpdateProfilePayload>({
    mutationFn: authApi.updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}
