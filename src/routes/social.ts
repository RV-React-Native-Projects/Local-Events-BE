import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  followUser,
  unfollowUser,
  isFollowing,
  getUserFollowers,
  getUserFollowing,
  addReview,
  updateReview,
  deleteReview,
  getUserReviews,
  hasUserReviewedEvent
} from '../db/queries/social';

const social = new Hono();

// Validation schemas
const followSchema = z.object({
  followerId: z.string().uuid(),
  followingId: z.string().uuid(),
});

const reviewSchema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(1).optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
});

// POST /social/follow - Follow user
social.post('/follow', zValidator('json', followSchema), async (c) => {
  try {
    const { followerId, followingId } = c.req.valid('json');
    
    // Prevent self-follow
    if (followerId === followingId) {
      return c.json({ success: false, error: 'Cannot follow yourself' }, 400);
    }
    
    // Check if already following
    const alreadyFollowing = await isFollowing(followerId, followingId);
    if (alreadyFollowing) {
      return c.json({ success: false, error: 'Already following this user' }, 400);
    }
    
    const follow = await followUser(followerId, followingId);
    
    return c.json({
      success: true,
      data: follow,
      message: 'Successfully followed user'
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to follow user' }, 500);
  }
});

// DELETE /social/unfollow - Unfollow user
social.delete('/unfollow', zValidator('json', followSchema), async (c) => {
  try {
    const { followerId, followingId } = c.req.valid('json');
    
    const unfollow = await unfollowUser(followerId, followingId);
    
    return c.json({
      success: true,
      data: unfollow,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to unfollow user' }, 500);
  }
});

// GET /social/following/:userId - Get user's following
social.get('/following/:userId', zValidator('query', paginationSchema), async (c) => {
  try {
    const userId = c.req.param('userId');
    const query = c.req.valid('query');
    const page = query.page || 1;
    const limit = query.limit || 10;
    const following = await getUserFollowing(userId, page, limit);
    
    return c.json({
      success: true,
      data: following
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch following' }, 500);
  }
});

// GET /social/followers/:userId - Get user's followers
social.get('/followers/:userId', zValidator('query', paginationSchema), async (c) => {
  try {
    const userId = c.req.param('userId');
    const query = c.req.valid('query');
    const page = query.page || 1;
    const limit = query.limit || 10;
    const followers = await getUserFollowers(userId, page, limit);
    
    return c.json({
      success: true,
      data: followers
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch followers' }, 500);
  }
});

// GET /social/following/:followerId/:followingId - Check if following
social.get('/following/:followerId/:followingId', async (c) => {
  try {
    const followerId = c.req.param('followerId');
    const followingId = c.req.param('followingId');
    
    const isFollowingUser = await isFollowing(followerId, followingId);
    
    return c.json({
      success: true,
      data: { isFollowing: isFollowingUser }
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to check following status' }, 500);
  }
});

// POST /social/reviews - Add review
social.post('/reviews', zValidator('json', reviewSchema), async (c) => {
  try {
    const reviewData = c.req.valid('json');
    
    // Check if user has already reviewed this event
    const hasReviewed = await hasUserReviewedEvent(reviewData.userId, reviewData.eventId);
    if (hasReviewed) {
      return c.json({ success: false, error: 'Already reviewed this event' }, 400);
    }
    
    const review = await addReview(reviewData);
    
    return c.json({
      success: true,
      data: review,
      message: 'Review added successfully'
    }, 201);
  } catch (error) {
    return c.json({ success: false, error: 'Failed to add review' }, 500);
  }
});

// PUT /social/reviews/:reviewId - Update review
social.put('/reviews/:reviewId', zValidator('json', updateReviewSchema), async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    const updateData = c.req.valid('json');
    
    const review = await updateReview(reviewId, updateData);
    
    return c.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to update review' }, 500);
  }
});

// DELETE /social/reviews/:reviewId - Delete review
social.delete('/reviews/:reviewId', async (c) => {
  try {
    const reviewId = c.req.param('reviewId');
    
    const review = await deleteReview(reviewId);
    
    return c.json({
      success: true,
      data: review,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to delete review' }, 500);
  }
});

// GET /social/reviews/user/:userId - Get user's reviews
social.get('/reviews/user/:userId', zValidator('query', paginationSchema), async (c) => {
  try {
    const userId = c.req.param('userId');
    const query = c.req.valid('query');
    const page = query.page || 1;
    const limit = query.limit || 10;
    const reviews = await getUserReviews(userId, page, limit);
    
    return c.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch user reviews' }, 500);
  }
});

export { social }; 