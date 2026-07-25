import { User } from "../database/schema";

declare global {
    namespace Express {
        interface Request {
            user?: typeof User;
        }
    }
}