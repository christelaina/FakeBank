import { apiRequest } from "@/lib/api/client";
import { getRepositories } from "@/lib/api";
import { getEnvironment } from "@/lib/config/environment";
import type { SecurityActivity } from "@/types/banking";

export async function getSecurityActivity(): Promise<SecurityActivity> {
  if (getEnvironment().isLiveMode) {
    return apiRequest<SecurityActivity>("/api/security/activity", { sameOrigin: true });
  }
  return getRepositories().security.getSecurityActivity();
}
