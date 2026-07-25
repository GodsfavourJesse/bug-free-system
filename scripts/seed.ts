import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/database";
import { users, membershipPlans, dailyOrderConfigs } from "../src/database/schema";
import { hashPassword } from "../src/utils/hash";

async function seedMembershipPlans() {
    console.log("Checking membership plans...");

    const existingPlans = await db
        .select()
        .from(membershipPlans)
        .limit(1);

    if (existingPlans.length > 0) {
        console.log("Membership plans already exist.");
        return;
    }

    const plans = await db
        .insert(membershipPlans)
        .values([
            {
                name: "Internship Member",
                slug: "internship",
                upgradePrice: "0",
                lifetimeOrderLimit: null,
                sortOrder: 1,
                description: "Default membership for every new user.",

                invitationCommissionLevel1: "15",
                invitationCommissionLevel2: "5",
                invitationCommissionLevel3: "2",

                orderCommissionLevel1: "10",
                orderCommissionLevel2: "5",
                orderCommissionLevel3: "2",

                isInternship: true,
                isActive: true,
                canUpgradeTo: true,
            },

            {
                name: "1-Star Member",
                slug: "1-star",
                upgradePrice: "5000",
                lifetimeOrderLimit: null,
                sortOrder: 2,
                description: "First premium membership.",

                invitationCommissionLevel1: "15",
                invitationCommissionLevel2: "5",
                invitationCommissionLevel3: "2",

                orderCommissionLevel1: "10",
                orderCommissionLevel2: "5",
                orderCommissionLevel3: "2",

                isInternship: false,
                isActive: true,
                canUpgradeTo: true,
            },

            {
                name: "2-Star Member",
                slug: "2-star",
                upgradePrice: "15000",
                lifetimeOrderLimit: null,
                sortOrder: 3,
                description: "Intermediate membership.",

                invitationCommissionLevel1: "15",
                invitationCommissionLevel2: "5",
                invitationCommissionLevel3: "2",

                orderCommissionLevel1: "10",
                orderCommissionLevel2: "5",
                orderCommissionLevel3: "2",

                isInternship: false,
                isActive: true,
                canUpgradeTo: true,
            },

            {
                name: "3-Star Member",
                slug: "3-star",
                upgradePrice: "50000",
                lifetimeOrderLimit: null,
                sortOrder: 4,
                description: "Advanced membership.",

                invitationCommissionLevel1: "15",
                invitationCommissionLevel2: "5",
                invitationCommissionLevel3: "2",

                orderCommissionLevel1: "10",
                orderCommissionLevel2: "5",
                orderCommissionLevel3: "2",

                isInternship: false,
                isActive: true,
                canUpgradeTo: true,
            },

            {
                name: "VIP Member",
                slug: "vip",
                upgradePrice: "100000",
                lifetimeOrderLimit: null,
                sortOrder: 5,
                description: "Highest membership tier.",

                invitationCommissionLevel1: "15",
                invitationCommissionLevel2: "5",
                invitationCommissionLevel3: "2",

                orderCommissionLevel1: "10",
                orderCommissionLevel2: "5",
                orderCommissionLevel3: "2",

                isInternship: false,
                isActive: true,
                canUpgradeTo: true,
            },
        ])
        .returning();

    console.log("Membership plans created.");

    return plans;
}

async function seedDailyOrderConfigs() {
    console.log("Checking daily order configurations...");

    const existingConfigs = await db
        .select()
        .from(dailyOrderConfigs)
        .limit(1);

    if (existingConfigs.length > 0) {
        console.log("Daily order configurations already exist.");
        return;
    }

    const plans = await db
        .select()
        .from(membershipPlans);

    const configMap: Record<
        string,
        {
            tasksPerDay: number;
            rewardPerTask: string;
        }
    > = {
        internship: {
            tasksPerDay: 5,
            rewardPerTask: "50",
        },

        "1-star": {
            tasksPerDay: 10,
            rewardPerTask: "120",
        },

        "2-star": {
            tasksPerDay: 20,
            rewardPerTask: "300",
        },

        "3-star": {
            tasksPerDay: 35,
            rewardPerTask: "700",
        },

        vip: {
            tasksPerDay: 50,
            rewardPerTask: "1500",
        },
    };

    const configs = plans.map((plan) => {
        const config = configMap[plan.slug];

        return {
            membershipPlanId: plan.id,

            tasksPerDay: config.tasksPerDay,
            rewardPerTask: config.rewardPerTask,

            dailyRewardLimit: (
                config.tasksPerDay *
                Number(config.rewardPerTask)
            ).toFixed(2),

            isActive: true,
        };
    });

    await db.insert(dailyOrderConfigs).values(configs);

    console.log("Daily order configurations created.");
}

async function seedAdmin() {
    console.log("Checking for existing admin...");

    const existingAdmin = await db
        .select()
        .from(users)
        .where(eq(users.role, "admin"))
        .limit(1);

    if (existingAdmin.length > 0) {
        console.log("Admin already exists.");
        return;
    }

    const hashedPassword = await hashPassword(
        process.env.ADMIN_PASSWORD!,
    );

    const [admin] = await db
        .insert(users)
        .values({
            phone: process.env.ADMIN_PHONE!,
            email: process.env.ADMIN_EMAIL!,
            password: hashedPassword,

            role: "admin",

            membershipPlanId: null,

            referralCode: process.env.ADMIN_REFERRAL_CODE!,

            referredBy: null,
            isVerified: true,
            isActive: true,
            canUpgrade: false,
        })
        .returning();

    console.log("Admin created successfully.");
    console.log(admin);
}

async function main() {
    try {
        await seedMembershipPlans();

        await seedDailyOrderConfigs();

        await seedAdmin();

        console.log("Database seeding completed.");

        process.exit(0);
    } catch (error) {
        console.error("Database seeding failed.");
        console.error(error);

        process.exit(1);
    }
}

main();