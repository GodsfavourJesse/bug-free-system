import { users } from "../../database/schema";

export type ReferralUser =
    typeof users.$inferSelect;

export interface ReferralTreeNode {
    user: ReferralUser;
    children: ReferralTreeNode[];
}