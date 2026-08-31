import { users } from "../../database/schema";

export interface ReferralUser {
    id: string;
    phone: string;
    email: string | null;
    referralCode: string;
    membershipPlanId: string | null;
    isActive: boolean;
    createdAt: Date;
}

export interface ReferralTreeNode {
    user: ReferralUser;
    children: ReferralTreeNode[];
}