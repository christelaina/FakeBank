import { getRepositories } from "@/lib/api";

export async function getPortfolio() {
  return getRepositories().investments.getPortfolio();
}
