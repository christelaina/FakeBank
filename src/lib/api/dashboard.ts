import { getRepositories } from "@/lib/api";
import { getEnvironment } from "@/lib/config/environment";
import * as neonDashboard from "@/lib/server/dashboard";
import * as neonInvestments from "@/lib/server/investments";

export async function getDashboardData() {
  if (getEnvironment().isMockMode) {
    const repos = getRepositories();
    const [summary, portfolio] = await Promise.all([
      repos.dashboard.getSummary(),
      repos.investments.getPortfolio(),
    ]);
    return { summary, portfolio };
  }

  const [summary, portfolio] = await Promise.all([
    neonDashboard.getDashboardSummary(),
    neonInvestments.getPortfolio(),
  ]);
  return {
    summary: {
      ...summary,
      totalAssets:
        Math.round((summary.totalAssets + portfolio.totalValue) * 100) / 100,
      portfolioValue: portfolio.totalValue,
    },
    portfolio,
  };
}
