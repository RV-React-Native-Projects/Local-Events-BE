import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  getUserNotifications,
  getUnreadNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationCount,
  getUnreadNotificationCount
} from '../db/queries/notifications';

const notifications = new Hono();

// Validation schemas
const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  content: z.string().min(1),
  read: z.boolean().optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
});

// GET /notifications/user/:userId - Get user's notifications
notifications.get('/user/:userId', zValidator('query', paginationSchema), async (c) => {
  try {
    const userId = c.req.param('userId');
    const query = c.req.valid('query');
    const page = query.page || 1;
    const limit = query.limit || 10;
    const notifications = await getUserNotifications(userId, page, limit);
    
    return c.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch notifications' }, 500);
  }
});

// GET /notifications/user/:userId/unread - Get unread notifications
notifications.get('/user/:userId/unread', zValidator('query', paginationSchema), async (c) => {
  try {
    const userId = c.req.param('userId');
    const query = c.req.valid('query');
    const page = query.page || 1;
    const limit = query.limit || 10;
    const unreadNotifications = await getUnreadNotifications(userId, page, limit);
    
    return c.json({
      success: true,
      data: unreadNotifications
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch unread notifications' }, 500);
  }
});

// GET /notifications/user/:userId/count - Get notification count
notifications.get('/user/:userId/count', async (c) => {
  try {
    const userId = c.req.param('userId');
    const totalCount = await getNotificationCount(userId);
    const unreadCount = await getUnreadNotificationCount(userId);
    
    return c.json({
      success: true,
      data: {
        total: totalCount,
        unread: unreadCount
      }
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch notification count' }, 500);
  }
});

// POST /notifications - Create notification
notifications.post('/', zValidator('json', createNotificationSchema), async (c) => {
  try {
    const notificationData = c.req.valid('json');
    const notification = await createNotification(notificationData);
    
    return c.json({
      success: true,
      data: notification
    }, 201);
  } catch (error) {
    return c.json({ success: false, error: 'Failed to create notification' }, 500);
  }
});

// PUT /notifications/:id/read - Mark notification as read
notifications.put('/:id/read', async (c) => {
  try {
    const notificationId = c.req.param('id');
    const notification = await markNotificationAsRead(notificationId);
    
    return c.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to mark notification as read' }, 500);
  }
});

// PUT /notifications/user/:userId/read-all - Mark all notifications as read
notifications.put('/user/:userId/read-all', async (c) => {
  try {
    const userId = c.req.param('userId');
    const notifications = await markAllNotificationsAsRead(userId);
    
    return c.json({
      success: true,
      data: notifications,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to mark all notifications as read' }, 500);
  }
});

// DELETE /notifications/:id - Delete notification
notifications.delete('/:id', async (c) => {
  try {
    const notificationId = c.req.param('id');
    const notification = await deleteNotification(notificationId);
    
    return c.json({
      success: true,
      data: notification,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    return c.json({ success: false, error: 'Failed to delete notification' }, 500);
  }
});

export { notifications }; 