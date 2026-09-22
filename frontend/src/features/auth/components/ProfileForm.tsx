"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  LogOutIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/axios";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { UnverifiedEmailBanner } from "./UnverifiedEmailBanner";
import { useLogout } from "../hooks/useLogout";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import type { UpdateProfilePayload } from "../types/auth.types";
import {
  updateProfileSchema,
  type UpdateProfileSchema,
} from "../validations/auth.schema";

/**
 * Profile editor.
 *
 * Only the fields the API actually accepts are editable — `email` is rendered
 * read-only because `updateUserProfileSchema` on the server has no email field.
 * The form starts from the cached profile and only sends fields the user has
 * actually touched, since the API rejects an empty body.
 */
export function ProfileForm() {
  const { user, isAdmin } = useAuth();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      avatar_url: user?.avatar_url ?? "",
    },
  });

  const { reset, formState } = form;

  // The profile query can resolve after first paint when the page is loaded
  // directly, so re-seed the form once — but never over unsaved edits.
  useEffect(() => {
    if (!user || formState.isDirty) return;

    reset({
      name: user.name ?? "",
      phone: user.phone ?? "",
      avatar_url: user.avatar_url ?? "",
    });
  }, [user, reset, formState.isDirty]);

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    setSaved(false);

    const dirty = formState.dirtyFields;
    const payload: UpdateProfilePayload = {};

    // Empty string means "clear this field", and the API rejects "" for phone
    // and avatar_url — so an emptied field is simply left out of the request.
    if (dirty.name && values.name) payload.name = values.name;
    if (dirty.phone && values.phone) payload.phone = values.phone;
    if (dirty.avatar_url && values.avatar_url)
      payload.avatar_url = values.avatar_url;

    if (Object.keys(payload).length === 0) {
      setFormError("Change something before saving.");
      return;
    }

    try {
      await updateProfile.mutateAsync(payload);
      form.reset(values, { keepValues: true });
      setSaved(true);
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to save your profile."));
    }
  });

  return (
    <div className="grid gap-6">
      <UnverifiedEmailBanner />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              {user?.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <CardTitle className="truncate">
                {user?.name ?? "Your profile"}
              </CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                <span className="truncate">{user?.email}</span>
                <Badge variant={user?.isEmailVerified ? "success" : "secondary"}>
                  <BadgeCheckIcon />
                  {user?.isEmailVerified ? "Email verified" : "Unverified"}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Separator />

          <dl className="grid grid-cols-2 gap-4 pt-6 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="mt-0.5 font-medium capitalize">
                {user?.role ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="mt-0.5 font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last login</dt>
              <dd className="mt-0.5 font-medium">
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Keep your contact information up to date.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="grid gap-5" noValidate>
              {formError ? (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              {saved ? (
                <Alert variant="success">
                  <CircleCheckIcon />
                  <AlertDescription>
                    Your profile has been updated.
                  </AlertDescription>
                </Alert>
              ) : null}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="name"
                        placeholder="Ada Lovelace"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Outside <FormField>: this value is never submitted, so it has no
                  place in the form's field registry. */}
              <div className="grid gap-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-muted-foreground text-sm">
                  Your email address can&apos;t be changed.
                </p>
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1 555 0100"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional. 7–20 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional link to a profile picture.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  <LogOutIcon />
                  {logout.isPending ? "Signing out…" : "Sign out"}
                </Button>

                <LoadingButton
                  type="submit"
                  loading={updateProfile.isPending}
                  disabled={!formState.isDirty}
                >
                  {updateProfile.isPending ? "Saving…" : "Save changes"}
                </LoadingButton>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isAdmin ? (
        <p className="text-muted-foreground text-center text-xs">
          Signed in with administrator access.
        </p>
      ) : null}
    </div>
  );
}
