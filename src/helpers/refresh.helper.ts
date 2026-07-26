import { authRepository } from "../modules/auth/auth.repository";
import { tokenService } from "../modules/token/token.service";

export async function validateRefreshToken(
    token: string
) {
    const payload =
        tokenService.verifyRefreshToken(
            token
        );

    const storedToken =
        await authRepository.findRefreshToken(
            token
        );

    if (!storedToken) {
        throw new Error(
            "Refresh token is invalid."
        );
    }

    if (storedToken.expiresAt < new Date()) {
        throw new Error(
            "Refresh token has expired."
        );
    }

    const user =
        await authRepository.findUserById(
            payload.id
        );

    if (!user) {
        throw new Error(
            "User not found."
        );
    }

    if (!user.isActive) {
        throw new Error(
            "User account is inactive."
        );
    }

    return user;
}