import { UpgradeRequestStatus } from "../../../database/enums/upgrade.enum";
import { UpgradeRequestNotPendingError } from "./adminUPgrade.errors";

export class AdminUpgradeValidation {

    // Ensure the request is currently pending.
    ensurePendingRequest(
        request: {
            status: UpgradeRequestStatus;
        },
    ) {
        if (
            request.status !==
            UpgradeRequestStatus.PENDING
        ) {
            throw new UpgradeRequestNotPendingError();
        }
    }
}

export const adminUpgradeValidation =
    new AdminUpgradeValidation();