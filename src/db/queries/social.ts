import { eq, desc, and, or } from "drizzle-orm";
import { db } from "../db";
import { follows, users, eventReviews, events } from "../schema";

// Follow user
export const followUser = async (followerId: string, followingId: string) => {
  const [follow] = await db
    .insert(follows)
    .values({
      followerId,
      followingId,
    })
    .returning();

  return follow;
};

// Unfollow user
export const unfollowUser = async (followerId: string, followingId: string) => {
  const [follow] = await db
    .delete(follows)
    .where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      )
    )
    .returning();

  return follow;
};

// Check if user is following another user
export const isFollowing = async (followerId: string, followingId: string) => {
  const [follow] = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      )
    );

  return !!follow;
};

// Get user's followers
export const getUserFollowers = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const followers = await db
    .select({
      user: users,
      followedAt: follows.followedAt,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(follows.followedAt));

  return followers;
};

// Get user's following
export const getUserFollowing = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const following = await db
    .select({
      user: users,
      followedAt: follows.followedAt,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(follows.followedAt));

  return following;
};

// Get mutual followers
export const getMutualFollowers = async (userId1: string, userId2: string) => {
  const mutualFollowers = await db
    .select({
      user: users,
    })
    .from(follows as any)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(
      and(
        eq(follows.followingId, userId1),
        // This is a simplified version - in a real implementation you'd need a more complex query
        // to find users who follow both userId1 and userId2
        eq(follows.followingId, userId2)
      )
    );

  return mutualFollowers;
};

// Add event review
export const addReview = async (reviewData: {
  eventId: string;
  userId: string;
  rating: number;
  comment: string;
}) => {
  const [review] = await db.insert(eventReviews).values(reviewData).returning();

  return review;
};

// Update event review
export const updateReview = async (
  reviewId: string,
  updateData: Partial<{
    rating: number;
    comment: string;
  }>
) => {
  const [review] = await db
    .update(eventReviews)
    .set(updateData)
    .where(eq(eventReviews.id, reviewId))
    .returning();

  return review;
};

// Delete event review
export const deleteReview = async (reviewId: string) => {
  const [review] = await db
    .delete(eventReviews)
    .where(eq(eventReviews.id, reviewId))
    .returning();

  return review;
};

// Get user's reviews
export const getUserReviews = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const reviews = await db
    .select({
      review: eventReviews,
      event: events,
    })
    .from(eventReviews)
    .innerJoin(events, eq(eventReviews.eventId, events.id))
    .where(eq(eventReviews.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(eventReviews.createdAt));

  return reviews;
};

// Check if user has reviewed event
export const hasUserReviewedEvent = async (userId: string, eventId: string) => {
  const [review] = await db
    .select()
    .from(eventReviews)
    .where(
      and(eq(eventReviews.userId, userId), eq(eventReviews.eventId, eventId))
    );

  return !!review;
};
