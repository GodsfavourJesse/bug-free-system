import { randomBytes } from "node:crypto";
import { authRepository } from "../modules/auth/auth.repository";

export async function generateReferralCode(): Promise<string> {

    while (true) {

        const code =
            "WC-" +
            randomBytes(4)
                .toString("hex")
                .toUpperCase();

        const exists =
            await authRepository.findUserByReferralCode(
                code
            );

        if (!exists) {
            return code;
        }
    }
}