import "dotenv/config";

import { eq } from "drizzle-orm";

import { db } from "../src/database";

import {
    users,
    membershipPlans,
    dailyOrderConfigs,
    wallets,
} from "../src/database/schema";

import { hashPassword } from "../src/utils/hash";

import { TIERS } from "../src/constants/membership-tiers.constants";


// ============================================================
// MEMBERSHIP PLANS
// ============================================================

async function seedMembershipPlans() {
    console.log("Synchronizing membership plans...");

    const plans = [];

    for (const tier of TIERS) {

        const [existingPlan] = await db
            .select()
            .from(membershipPlans)
            .where(
                eq(
                    membershipPlans.slug,
                    tier.slug,
                ),
            )
            .limit(1);

        // ----------------------------------------------------
        // UPDATE EXISTING PLAN
        // ----------------------------------------------------

        if (existingPlan) {

            const [updatedPlan] = await db
                .update(membershipPlans)
                .set({
                    name: tier.name,

                    upgradePrice:
                        tier.price.toString(),

                    lifetimeOrderLimit: null,

                    sortOrder:
                        tier.tierIndex,

                    description:
                        tier.description,

                    invitationCommissionLevel1:
                        tier.invitation.level1.toString(),

                    invitationCommissionLevel2:
                        tier.invitation.level2.toString(),

                    invitationCommissionLevel3:
                        tier.invitation.level3.toString(),

                    orderCommissionLevel1:
                        tier.order.level1.toString(),

                    orderCommissionLevel2:
                        tier.order.level2.toString(),

                    orderCommissionLevel3:
                        tier.order.level3.toString(),

                    isInternship:
                        tier.internship,

                    isActive: true,

                    canUpgradeTo:
                        !tier.internship,

                    updatedAt: new Date(),
                })
                .where(
                    eq(
                        membershipPlans.id,
                        existingPlan.id,
                    ),
                )
                .returning();

            plans.push(updatedPlan);

            console.log(
                `Updated membership: ${tier.name}`,
            );

        }

        // ----------------------------------------------------
        // CREATE NEW PLAN
        // ----------------------------------------------------

        else {

            const [createdPlan] = await db
                .insert(membershipPlans)
                .values({
                    name: tier.name,

                    slug: tier.slug,

                    upgradePrice:
                        tier.price.toString(),

                    lifetimeOrderLimit: null,

                    sortOrder:
                        tier.tierIndex,

                    description:
                        tier.description,

                    invitationCommissionLevel1:
                        tier.invitation.level1.toString(),

                    invitationCommissionLevel2:
                        tier.invitation.level2.toString(),

                    invitationCommissionLevel3:
                        tier.invitation.level3.toString(),

                    orderCommissionLevel1:
                        tier.order.level1.toString(),

                    orderCommissionLevel2:
                        tier.order.level2.toString(),

                    orderCommissionLevel3:
                        tier.order.level3.toString(),

                    isInternship:
                        tier.internship,

                    isActive: true,

                    canUpgradeTo:
                        !tier.internship,
                })
                .returning();

            plans.push(createdPlan);

            console.log(
                `Created membership: ${tier.name}`,
            );
        }
    }

    console.log(
        "Membership plans synchronized successfully.",
    );

    return plans;
}


// ============================================================
// DAILY ORDER CONFIGURATIONS
// ============================================================

async function seedDailyOrderConfigs() {
    console.log(
        "Synchronizing daily order configurations...",
    );

    const plans = await db
        .select()
        .from(membershipPlans);

    for (const plan of plans) {

        const tier = TIERS.find(
            (t) => t.slug === plan.slug,
        );

        if (!tier) {
            console.warn(
                `Skipping ${plan.name}: no matching tier found.`,
            );

            continue;
        }

        // ----------------------------------------------------
        // Calculate reward per task
        // ----------------------------------------------------

        const rewardPerTask =
            tier.dailyRevenue /
            tier.dailyOrders;


        // ----------------------------------------------------
        // Check existing configuration
        // ----------------------------------------------------

        const [existingConfig] = await db
            .select()
            .from(dailyOrderConfigs)
            .where(
                eq(
                    dailyOrderConfigs.membershipPlanId,
                    plan.id,
                ),
            )
            .limit(1);


        // ----------------------------------------------------
        // UPDATE EXISTING CONFIG
        // ----------------------------------------------------

        if (existingConfig) {

            await db
                .update(dailyOrderConfigs)
                .set({
                    tasksPerDay:
                        tier.dailyOrders,

                    rewardPerTask:
                        rewardPerTask.toFixed(2),

                    dailyRewardLimit:
                        tier.dailyRevenue.toFixed(2),

                    isActive: true,
                })
                .where(
                    eq(
                        dailyOrderConfigs.id,
                        existingConfig.id,
                    ),
                );

            console.log(
                `Updated daily config: ${tier.name} | ` +
                `${tier.dailyOrders} tasks | ` +
                `₦${rewardPerTask.toFixed(2)} per task | ` +
                `₦${tier.dailyRevenue.toFixed(2)} daily`,
            );

        }

        // ----------------------------------------------------
        // CREATE NEW CONFIG
        // ----------------------------------------------------

        else {

            await db
                .insert(dailyOrderConfigs)
                .values({
                    membershipPlanId:
                        plan.id,

                    tasksPerDay:
                        tier.dailyOrders,

                    rewardPerTask:
                        rewardPerTask.toFixed(2),

                    dailyRewardLimit:
                        tier.dailyRevenue.toFixed(2),

                    isActive: true,
                });

            console.log(
                `Created daily config: ${tier.name} | ` +
                `${tier.dailyOrders} tasks | ` +
                `₦${rewardPerTask.toFixed(2)} per task | ` +
                `₦${tier.dailyRevenue.toFixed(2)} daily`,
            );
        }
    }

    console.log(
        "Daily order configurations synchronized successfully.",
    );
}


// ============================================================
// ADMIN
// ============================================================

async function seedAdmin() {
    console.log("Checking for existing admin...");

    const existingAdmin = await db
        .select()
        .from(users)
        .where(
            eq(
                users.role,
                "admin",
            ),
        )
        .limit(1);

    if (existingAdmin.length > 0) {

        const admin = existingAdmin[0];

        const existingWallet = await db
            .select()
            .from(wallets)
            .where(
                eq(
                    wallets.userId,
                    admin.id,
                ),
            )
            .limit(1);

        if (existingWallet.length === 0) {

            await db
                .insert(wallets)
                .values({
                    userId: admin.id,

                    availableBalance:
                        "999999999.00",

                    heldBalance:
                        "0.00",

                    totalEarned:
                        "0.00",

                    totalDeposited:
                        "0.00",

                    totalWithdrawn:
                        "0.00",
                });

            console.log(
                "Admin wallet created successfully.",
            );

        } else {

            console.log(
                "Admin wallet already exists.",
            );
        }

        console.log(
            "Admin already exists.",
        );

        return;
    }


    // --------------------------------------------------------
    // Create admin
    // --------------------------------------------------------

    const hashedPassword =
        await hashPassword(
            process.env.ADMIN_PASSWORD!,
        );


    const [admin] = await db
        .insert(users)
        .values({
            phone:
                process.env.ADMIN_PHONE!,

            email:
                process.env.ADMIN_EMAIL!,

            password:
                hashedPassword,

            role:
                "admin",

            country:
                "Nigeria",

            membershipPlanId:
                null,

            referralCode:
                process.env.ADMIN_REFERRAL_CODE!,

            referredBy:
                null,

            isVerified:
                true,

            isActive:
                true,

            canUpgrade:
                false,
        })
        .returning();


    // --------------------------------------------------------
    // Create admin wallet
    // --------------------------------------------------------

    await db
        .insert(wallets)
        .values({
            userId:
                admin.id,

            availableBalance:
                "999999999.00",

            heldBalance:
                "0.00",

            totalEarned:
                "0.00",

            totalDeposited:
                "0.00",

            totalWithdrawn:
                "0.00",
        });


    console.log(
        "Admin created successfully.",
    );

    console.log(
        "Admin wallet created.",
    );

    console.log(admin);
}


// ============================================================
// MAIN
// ============================================================

async function main() {

    try {

        // Membership plans must exist first.
        await seedMembershipPlans();

        // Daily configurations depend on membership plans.
        await seedDailyOrderConfigs();

        // Admin is independent.
        await seedAdmin();

        console.log(
            "Database seeding completed successfully.",
        );

        process.exit(0);

    } catch (error) {

        console.error(
            "Database seeding failed.",
        );

        console.error(error);

        process.exit(1);
    }
}

main();