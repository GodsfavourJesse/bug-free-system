import { db } from "..";

export type DbExecutor =
    | typeof db
    | Parameters<
          Parameters<typeof db.transaction>[0]
      >[0];