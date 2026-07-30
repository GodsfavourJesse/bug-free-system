import { users } from "../../database/schema";

type User = typeof users.$inferSelect;

export const toUserResponse = (user: User) => ({
    id: user.id,
    phone: user.phone,
    email: user.email,
    role: user.role,

    country: user.country,

    referralCode: user.referralCode,

    isVerified: user.isVerified,
    isActive: user.isActive,

    createdAt: user.createdAt,
});