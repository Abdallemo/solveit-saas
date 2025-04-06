import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    pgEnum,
    uuid,
} from "drizzle-orm/pg-core"

export const UserRole = pgEnum('role',['ADMIN','MODERATOR','POSTER','SOLVER'])
export const TierEnum = pgEnum('tier',['BASIC','PREMIUM'])

export type UserRoleType = (typeof UserRole.enumValues)[number];


export const users = pgTable("user", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text("name"),
    email: text("email").unique(),
    password:text("password"),
    role:UserRole("role").default('POSTER'),
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

export const verificationTokens = pgTable(
    "verificationToken",
    {
      id: uuid().defaultRandom().notNull(),
      email: text("email"),
      token: text("token").unique(),
      expires: timestamp("expires", { mode: "date" }).notNull()

    },
    (verificationToken) => [
      {
        compositePk: primaryKey({
          columns: [verificationToken.email, verificationToken.token],
        }),
      },
    ]
  )

export const UserSubscriptionTable = pgTable('subscription',{
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid('userId').notNull()
    .references(() => users.id, { onDelete: "cascade" }),
    stripeSubscriptionItemId: text("stripe_subscription_item_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeCustomerId: text("stripe_customer_id"),
    tier: TierEnum("tier").notNull(),
})