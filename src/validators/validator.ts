import { z } from "zod";

// User Registration
export const registerSchema = z
    .object({
        phone: z
            .string()
            .trim()
            .transform((value) => value.replace(/\s+/g, ""))
            .refine(
                (value) => /^[0-9]{10,15}$/.test(value),
                "Invalid phone number."
            ),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .max(100)
            .regex(/[A-Z]/, "Password must contain an uppercase letter.")
            .regex(/[a-z]/, "Password must contain a lowercase letter.")
            .regex(/[0-9]/, "Password must contain a number."),

        confirmPassword: z.string(),

        country: z
            .string()
            .trim()
            .min(2, "Country is required."),

        referral:z
            .string()
            .trim()
            .toUpperCase()
            .min(4,"Referral code is required.")
            .max(30),
    })
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            path: ["confirmPassword"],
            message: "Passwords do not match.",
        }
    )
    .strict();

// User Login
export const loginSchema = z
    .object({
        phone: z
            .string()
            .trim()
            .transform((value) => value.replace(/\s+/g, ""))
            .refine(
                (value) => /^[0-9]{10,15}$/.test(value),
                "Invalid phone number."
            ),

        password: z
            .string()
            .min(1, "Password is required."),
    })
    .strict();

// Admin Login
export const adminLoginSchema = z
    .object({
        email: z
            .string()
            .trim()
            .email("Invalid email address.")
            .toLowerCase(),

        password: z
            .string()
            .min(1, "Password is required."),
    })
    .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;