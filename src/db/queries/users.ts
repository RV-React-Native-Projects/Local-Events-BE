import { eq, desc, asc, like, and, or } from "drizzle-orm";
import { db } from "../db";
import { users, accounts, events, eventParticipants, follows, notifications } from "../schema";

// Get all users with pagination
export const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const allUsers = await db
    .select()
    .from(users)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(users.createdAt));

  const totalCount = await db
    .select({ count: users.id })
    .from(users);

  return {
    users: allUsers,
    pagination: {
      page,
      limit,
      total: totalCount.length,
      totalPages: Math.ceil(totalCount.length / limit)
    }
  };
};

// Get user by ID
export const getUserById = async (userId: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  return user;
};

// Get user by email
export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  return user;
};

// Get user by username
export const getUserByUsername = async (username: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  return user;
};

// Create new user
export const createUser = async (userData: {
  name: string;
  email: string;
  username?: string;
  bio?: string;
  image?: string;
}) => {
  const [user] = await db
    .insert(users)
    .values(userData)
    .returning();

  return user;
};

// Update user
export const updateUser = async (
  userId: string,
  updateData: Partial<{
    name: string;
    email: string;
    username: string;
    bio: string;
    image: string;
  }>
) => {
  const [updatedUser] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
};

// Delete user
export const deleteUser = async (userId: string) => {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning();

  return deletedUser;
};

// Search users
export const searchUsers = async (query: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const searchResults = await db
    .select()
    .from(users)
    .where(
      or(
        like(users.name, `%${query}%`),
        like(users.username, `%${query}%`),
        like(users.bio, `%${query}%`)
      )
    )
    .limit(limit)
    .offset(offset)
    .orderBy(desc(users.createdAt));

  return searchResults;
};

// Get user profile with stats
export const getUserProfile = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) return null;

  // Get user's events count
  const userEvents = await db
    .select({ count: events.id })
    .from(events)
    .where(eq(events.organizerId, userId));

  // Get user's participations count
  const userParticipations = await db
    .select({ count: eventParticipants.userId })
    .from(eventParticipants)
    .where(eq(eventParticipants.userId, userId));

  // Get followers count
  const followers = await db
    .select({ count: follows.followerId })
    .from(follows)
    .where(eq(follows.followingId, userId));

  // Get following count
  const following = await db
    .select({ count: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, userId));

  return {
    ...user,
    stats: {
      eventsCreated: userEvents.length,
      eventsParticipated: userParticipations.length,
      followers: followers.length,
      following: following.length
    }
  };
};

// Get user's events
export const getUserEvents = async (userId: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const userEvents = await db
    .select()
    .from(events)
    .where(eq(events.organizerId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(events.date));

  return userEvents;
};

// Get user's participations
export const getUserParticipations = async (userId: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const participations = await db
    .select({
      event: events,
      joinedAt: eventParticipants.joinedAt
    })
    .from(eventParticipants)
    .innerJoin(events, eq(eventParticipants.eventId, events.id))
    .where(eq(eventParticipants.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(eventParticipants.joinedAt));

  return participations;
}; 