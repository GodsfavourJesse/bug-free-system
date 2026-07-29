import {
    InferInsertModel,
    InferSelectModel,
} from "drizzle-orm";
import { completedAdvertisements } from "../../database/schema";


export type CompletedAdvertisement =
    InferSelectModel<
        typeof completedAdvertisements
    >;

export type CreateCompletedAdvertisementDto =
    InferInsertModel<
        typeof completedAdvertisements
    >;