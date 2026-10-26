"use client";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/client";
import { useState } from "react";

export function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await apiRequest("/api/auth/sign-out", { method: "POST", sameOrigin: true });
    } finally {
      window.location.assign("/sign-in");
    }
  }

  return (
    <Button variant="secondary" onClick={signOut} disabled={signingOut}>
      {signingOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
