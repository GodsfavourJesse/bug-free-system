import { authRepository } from "@/modules/auth/auth.repository";
import { comparePassword } from "@/utils/hash";

export async function validateUserLogin(
    phone: string,
    password: string
) {
    const user =
        await authRepository.findUserByPhone(
            phone
        );

    if (!user) {
        throw new Error(
            "Invalid phone number or password."
        );
    }

    if (!user.isActive) {
        throw new Error(
            "Account has been deactivated."
        );
    }

    const matches =
        await comparePassword(
            password,
            user.password
        );

    if (!matches) {
        throw new Error(
            "Invalid phone number or password."
        );
    }

    return user;
}

export async function validateAdminLogin(
    email: string,
    password: string
) {
    const admin =
        await authRepository.findUserByEmail(
            email
        );

    if (!admin || admin.role !== "admin") {
        throw new Error(
            "Invalid admin credentials."
        );
    }

    if (!admin.isActive) {
        throw new Error(
            "Admin account is inactive."
        );
    }

    const matches =
        await comparePassword(
            password,
            admin.password
        );

    if (!matches) {
        throw new Error(
            "Invalid admin credentials."
        );
    }

    return admin;
}