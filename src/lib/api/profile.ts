import { apiRequest } from "@/lib/api/client";
import { getRepositories } from "@/lib/api";
import { getEnvironment } from "@/lib/config/environment";
import type { ProfileChangeEntry, ProfileUpdateInput, UserProfile } from "@/types/banking";

// Cache-busting URL for the stored picture; the version changes on each upload.
export function profilePictureSrc(version: string): string {
  return `/api/profile/picture?v=${encodeURIComponent(version)}`;
}

export async function getProfile(): Promise<UserProfile> {
  if (getEnvironment().isLiveMode) {
    return apiRequest<UserProfile>("/api/profile", { sameOrigin: true });
  }
  return getRepositories().profile.getProfile();
}

export async function updateProfile(input: ProfileUpdateInput): Promise<UserProfile> {
  if (getEnvironment().isLiveMode) {
    return apiRequest<UserProfile>("/api/profile", {
      method: "PATCH",
      body: input,
      sameOrigin: true,
    });
  }
  return getRepositories().profile.updateProfile(input);
}

export async function getProfileChangeHistory(): Promise<ProfileChangeEntry[]> {
  if (getEnvironment().isLiveMode) {
    return apiRequest<ProfileChangeEntry[]>("/api/profile/history", { sameOrigin: true });
  }
  return getRepositories().profile.getChangeHistory();
}
