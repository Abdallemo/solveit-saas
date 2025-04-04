import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    pgEnum,
    uuid,
} from "drizzle-orm/pg-core"

export const UserRole = pgEnum('userRole',['admin','moderator','poster','solver'])

export type UserRoleType = (typeof UserRole.enumValues)[number];


export const users = pgTable("user", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text("name"),
    email: text("email").unique(),
    password:text("password"),
    role:UserRole("role").default('poster'),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
})


export const accounts = pgTable(
    "account",
    {
        userId: uuid('userId').notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        {
            compoundKey: primaryKey({
                columns: [account.provider, account.providerAccountId],
            }),
        },
    ]
)

