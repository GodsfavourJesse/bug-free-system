import { and, asc, count, desc, eq, gte, ilike, lte, or, SQL } from "drizzle-orm";

import { db } from "@/database";
import { users } from "@/database/schema";
import { DbExecutor } from "@/database/types/types";

import { PaginationDto, SearchUsersDto, FilterUsersDto } from "./admin-user.dto";

export function getPagination(dto: PaginationDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    return {
        page,
        limit,
        offset: (page - 1) * limit,
    };
}

export class AdminUserRepository {

    private getSortColumn(
        dto: PaginationDto,
    ) {
        const sortableColumns = {
            createdAt: users.createdAt,
            email: users.email,
            role: users.role,
            isActive: users.isActive,
            isVerified: users.isVerified,
        };

        const sortField =
            dto.sortBy ?? "createdAt";

        const sortOrder =
            dto.sortOrder ?? "desc";

        const column =
            sortableColumns[
                sortField as keyof typeof sortableColumns
            ] ?? users.createdAt;

        return sortOrder === "asc"
            ? asc(column)
            : desc(column);
    }

    // Return every user.
    async findAll(
        executor: DbExecutor = db,
        dto: PaginationDto,
    ) {
        const { limit, offset } = getPagination(dto);
        const [items, total] =
            await Promise.all([

                executor
                    .select()
                    .from(users)
                    .orderBy(
                        this.getSortColumn(dto),
                    )
                    .limit(limit)
                    .offset(offset),

                executor
                    .select({
                        count: count(),
                    })
                    .from(users),

            ]);

        return {
            items,
            total: total[0].count,
        };
    }

    // Search users.
    async search(
        executor: DbExecutor = db,
        dto: SearchUsersDto,
    ) {

        const { limit, offset } = getPagination(dto);

        const query = `%${dto.query}%`;

        const condition = or(
            ilike(
                users.email,
                query,
            ),

            ilike(
                users.phone,
                query,
            ),

            ilike(
                users.referralCode,
                query,
            ),
        );

        const [items, total] =
            await Promise.all([

                executor
                    .select()
                    .from(users)
                    .where(
                        condition,
                    )
                    .orderBy(
                        this.getSortColumn(dto),
                    )
                    .limit(limit)
                    .offset(offset),

                executor
                    .select({
                        count: count(),
                    })
                    .from(users)
                    .where(
                        condition,
                    ),

            ]);

        return {
            items,
            total: total[0].count,
        };
    }

    // Filter users.
    async filter(
        executor: DbExecutor = db,
        dto: FilterUsersDto,
    ) {

        const { limit, offset } = getPagination(dto);

        const conditions: SQL[] = [];

        if (dto.membershipPlanId) {
            conditions.push(
                eq(
                    users.membershipPlanId,
                    dto.membershipPlanId,
                ),
            );
        }

        if (dto.isActive !== undefined) {
            conditions.push(
                eq(
                    users.isActive,
                    dto.isActive,
                ),
            );
        }

        if (dto.isVerified !== undefined) {
            conditions.push(
                eq(
                    users.isVerified,
                    dto.isVerified,
                ),
            );
        }

        if (dto.role) {
            conditions.push(
                eq(
                    users.role,
                    dto.role as any,
                ),
            );
        }

        if (dto.createdFrom) {
            conditions.push(
                gte(
                    users.createdAt,
                    dto.createdFrom,
                ),
            );
        }

        if (dto.createdTo) {
            conditions.push(
                lte(
                    users.createdAt,
                    dto.createdTo,
                ),
            );
        }


        const whereClause =
            conditions.length > 0
                ? and(
                      ...conditions,
                  )
                : undefined;

        const [items, total] =
            await Promise.all([

                executor
                    .select()
                    .from(users)
                    .where(
                        whereClause,
                    )
                    .orderBy(
                        this.getSortColumn(dto),
                    )
                    .limit(limit)
                    .offset(offset),

                executor
                    .select({
                        count: count(),
                    })
                    .from(users)
                    .where(
                        whereClause,
                    ),

            ]);

        return {
            items,
            total: total[0].count,
        };
    }

    // Find a user by ID.
    async findById(
        executor: DbExecutor = db,
        userId: string,
    ) {

        const [user] =
            await executor
                .select()
                .from(users)
                .where(
                    eq(
                        users.id,
                        userId,
                    ),
                )
                .limit(1);

        return user;
    }

    // Suspend a user account.
    async suspend(
        executor: DbExecutor = db,
        userId: string,
    ) {

        const [user] =
            await executor
                .update(users)
                .set({
                    isActive: false,
                })
                .where(
                    eq(
                        users.id,
                        userId,
                    ),
                )
                .returning();

        return user;
    }

    // Activate a user account.
    async activate(
        executor: DbExecutor = db,
        userId: string,
    ) {

        const [user] =
            await executor
                .update(users)
                .set({
                    isActive: true,
                })
                .where(
                    eq(
                        users.id,
                        userId,
                    ),
                )
                .returning();

        return user;
    }

    // Verify a user account.
    async verify(
        executor: DbExecutor = db,
        userId: string,
    ) {

        const [user] =
            await executor
                .update(users)
                .set({
                    isVerified: true,
                })
                .where(
                    eq(
                        users.id,
                        userId,
                    ),
                )
                .returning();

        return user;
    }

}

export const adminUserRepository =
    new AdminUserRepository();