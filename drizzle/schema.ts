import {
  sqliteTable,
  text,
  primaryKey,
  integer,
  int,
} from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "@auth/core/adapters";
import { relations } from "drizzle-orm";

export enum USER_ROLE {
  ADMIN = "Admin",
  USER = "User",
}

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: int("emailVerified", { mode: "timestamp" }),
  password: text("password"),
  role: text("role")
    .$type<USER_ROLE>()
    .$default(() => USER_ROLE.USER),
  isTwoFactorEnabled: int("isTwoFactorEnabled", { mode: "boolean" }).$default(
    () => false
  ),
  image: text("image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(sessions),
}));

export const InsertUser = users.$inferInsert;
export const User = users.$inferSelect;

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
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
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: int("expires", { mode: "timestamp" }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    id: text("id").notNull(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.id, vt.token] }),
  })
);

export const passwordResetTokens = sqliteTable(
  "passwordResetToken",
  {
    id: text("id").notNull(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.id, vt.token] }),
  })
);

export const twoFactorTokens = sqliteTable(
  "twoFactorToken",
  {
    id: text("id").notNull(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expires: int("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.id, vt.token] }),
  })
);

export const twoFactorConfirmations = sqliteTable("twoFactorConfirmation", {
  id: text("id").notNull(),
  userId: text("user_id")
    .unique()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const twoFactorConfirmationsRelation = relations(
  twoFactorConfirmations,
  ({ one }) => ({
    user: one(users, {
      fields: [twoFactorConfirmations.userId],
      references: [users.id],
    }),
  })
);
