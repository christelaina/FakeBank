import { getRepositories } from "@/lib/api";
import type { ProfileUpdateInput } from "@/types/banking";

export async function getProfile() {
  return getRepositories().profile.getProfile();
}

export async function updateProfile(input: ProfileUpdateInput) {
  return getRepositories().profile.updateProfile(input);
}

export async function getProfileChangeHistory() {
  return getRepositories().profile.getChangeHistory();
}
