import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, accounts } from "../schema";

// Get user account by provider
export const getUserAccount = async (userId: string, provider: string) => {
  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId) && eq(accounts.provider, provider));

  return account;
};

// Create user account
export const createUserAccount = async (accountData: {
  userId: string;
  provider: string;
  providerAccountId: string;
}) => {
  const [account] = await db
    .insert(accounts)
    .values(accountData)
    .returning();

  return account;
};

// Get user with account
export const getUserWithAccount = async (userId: string) => {
  const [user] = await db
    .select({
      user: users,
      account: accounts
    })
    .from(users)
    .leftJoin(accounts, eq(users.id, accounts.userId))
    .where(eq(users.id, userId));

  return user;
};

// Get user by provider account ID
export const getUserByProviderAccountId = async (provider: string, providerAccountId: string) => {
  const [user] = await db
    .select({
      user: users,
      account: accounts
    })
    .from(accounts)
    .innerJoin(users, eq(accounts.userId, users.id))
    .where(eq(accounts.provider, provider) && eq(accounts.providerAccountId, providerAccountId));

  return user;
}; 