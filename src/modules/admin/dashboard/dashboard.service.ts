import { dashboardRepository } from "./dashboard.repository";

const RECENT_ACTIVITY_LIMIT = 10;
const PENDING_REQUEST_LIMIT = 10;
const CHART_DAYS = 30;

export class DashboardService {
    /**
     * Returns everything required
     * for the admin dashboard.
     */
    async getDashboard() {
        const [
            statistics,
            recentActivities,
            pendingUpgradeRequests,
            pendingWithdrawals,
            membershipDistribution,
            revenue,
            userGrowth,
        ] = await Promise.all([
            dashboardRepository.findStatistics(),

            dashboardRepository.findRecentActivities(
                RECENT_ACTIVITY_LIMIT,
            ),

            dashboardRepository.findPendingUpgradeRequests(
                PENDING_REQUEST_LIMIT,
            ),

            dashboardRepository.findPendingWithdrawalRequests(
                PENDING_REQUEST_LIMIT,
            ),

            dashboardRepository.findMembershipDistribution(),

            dashboardRepository.findDailyRevenue(
                CHART_DAYS,
            ),

            dashboardRepository.findUserGrowth(
                CHART_DAYS,
            ),
        ]);

        return {
            statistics,
            recentActivities,
            pendingUpgradeRequests,
            pendingWithdrawals,
            membershipDistribution,
            revenue,
            userGrowth,
        };
    }
}

export const dashboardService =
    new DashboardService();