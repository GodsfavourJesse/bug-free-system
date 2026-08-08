export const TIERS = [
    {
        id: "internship",
        slug: "internship",
        tierIndex: 1,
        name: "Internship Member",

        description:
            "The internship period for intern members is 4 days. Complete four orders every day. Reward: You will receive NGN150 for each completed order, totaling NGN600 per day.",

        price: 0,
        dailyOrders: 4,
        dailyRevenue: 600,

        invitation: {
            level1: 0,
            level2: 0,
            level3: 0,
        },

        order: {
            level1: 0,
            level2: 0,
            level3: 0,
        },

        internship: true,
    },

    {
        id: "1-star",
        slug: "1-star",
        tierIndex: 2,
        name: "1-Star Member",

        description:
            "Number of promotion orders and commission income per day",

        price: 21600,
        dailyOrders: 4,
        dailyRevenue: 720,

        invitation: {
            level1: 10,
            level2: 3,
            level3: 1,
        },

        order: {
            level1: 3,
            level2: 2,
            level3: 1,
        },

        internship: false,
    },

    {
        id: "2-star",
        slug: "2-star",
        tierIndex: 3,
        name: "2-Star Member",

        description:
            "Number of promotion orders and commission income per day",

        price: 64800,
        dailyOrders: 8,
        dailyRevenue: 2160,

        invitation: {
            level1: 10,
            level2: 3,
            level3: 1,
        },

        order: {
            level1: 3,
            level2: 2,
            level3: 1,
        },

        internship: false,
    },

    {
        id: "3-star",
        slug: "3-star",
        tierIndex: 4,
        name: "3-Star Member",

        description:
            "Number of promotion orders and commission income per day",

        price: 207000,
        dailyOrders: 15,
        dailyRevenue: 6900,

        invitation: {
            level1: 10,
            level2: 3,
            level3: 1,
        },

        order: {
            level1: 3,
            level2: 2,
            level3: 1,
        },

        internship: false,
    },

    {
        id: "4-star",
        slug: "4-star",
        tierIndex: 5,
        name: "4-Star Member",

        description:
            "Number of promotion orders and commission income per day",

        price: 612500,
        dailyOrders: 25,
        dailyRevenue: 21875,

        invitation: {
            level1: 10,
            level2: 3,
            level3: 1,
        },

        order: {
            level1: 3,
            level2: 2,
            level3: 1,
        },

        internship: false,
    },
] as const;