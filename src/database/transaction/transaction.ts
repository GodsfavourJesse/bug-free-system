import { db } from "..";
import { DbExecutor } from "../types/types";

export async function withTransaction<T>(
    callback: (
        tx: DbExecutor,
    ) => Promise<T>,
) {
    return db.transaction(callback);
}