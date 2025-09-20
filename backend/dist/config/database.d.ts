import { PrismaClient } from '@prisma/client';
export declare const DATABASE_CONFIG: {
    url: string;
    pool: {
        min: number;
        max: number;
    };
};
export declare const prisma: PrismaClient<{
    datasources: {
        db: {
            url: string;
        };
    };
    log: ("query" | "warn" | "error")[];
}, "query" | "warn" | "error", import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=database.d.ts.map