import { getRepositories } from "@/lib/api";

export async function getSecurityActivity() {
  return getRepositories().security.getSecurityActivity();
}
