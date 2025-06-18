import AuthGate from "@/components/AuthGate";
import { getServerUserSession } from "@/features/auth/server/actions";
import AccountComponent from "@/features/users/components/poster/AccountComponent";
import { isUserAccountOauth } from "@/features/users/server/actions";
import React from "react";

export default async function PosterAccountPage() {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.id) return <AuthGate />;

  const isOauthUser = await isUserAccountOauth(currentUser.id);
  console.log("is this user oAuth Users ", isOauthUser);

  return <AccountComponent isOauthUser={isOauthUser} />;
}
