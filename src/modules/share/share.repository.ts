import {
    and,
    count,
    desc,
    eq,
    ilike,
} from "drizzle-orm";

import {
    db,
} from "../../database";

import {
    DbExecutor,
} from "../../database/types/types";

import {
    shares,
} from "../../database/schema";

import {
    ShareStatus,
} from "../../database/enums/share.enum";


export class ShareRepository {


    /**
     * Find share by ID.
     */
    async findById(
        executor: DbExecutor = db,
        id: string,
    ) {

        const [share] =
            await executor
                .select()
                .from(shares)
                .where(
                    eq(
                        shares.id,
                        id,
                    ),
                )
                .limit(1);

        return share ?? null;
    }



    /**
     * List shares.
     */
    async findAll(
        executor: DbExecutor = db,
        options: {
            page: number;
            limit: number;
            status?: ShareStatus;
            search?: string;
        },
    ) {

        const {
            page,
            limit,
            status,
            search,
        } = options;

        const offset =
            (page - 1) * limit;


        const conditions = [];


        if (status) {
            conditions.push(
                eq(
                    shares.status,
                    status,
                ),
            );
        }


        if (search) {
            conditions.push(
                ilike(
                    shares.name,
                    `%${search}%`,
                ),
            );
        }


        const whereClause =
            conditions.length > 0
                ? and(...conditions)
                : undefined;


        const data =
            await executor
                .select()
                .from(shares)
                .where(
                    whereClause,
                )
                .orderBy(
                    desc(
                        shares.createdAt,
                    ),
                )
                .limit(limit)
                .offset(offset);


        const [{ total }] =
            await executor
                .select({
                    total: count(),
                })
                .from(shares)
                .where(
                    whereClause,
                );


        return {
            data,
            total,
        };
    }


}


export const shareRepository =
    new ShareRepository();