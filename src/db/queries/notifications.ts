import { eq, desc, and } from "drizzle-orm";
import { db } from "../db";
import { notifications, users } from "../schema";

// Get user's notifications
export const getUserNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const userNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(notifications.createdAt));

  return userNotifications;
};

// Get unread notifications
export const getUnreadNotifications = async (
  userId: string,
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  const unreadNotifications = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(notifications.createdAt));

  return unreadNotifications;
};

// Create notification
export const createNotification = async (notificationData: {
  userId: string;
  content: string;
  read?: boolean;
}) => {
  const [notification] = await db
    .insert(notifications)
    .values(notificationData)
    .returning();

  return notification;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const [notification] = await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId))
    .returning();

  return notification;
};

// Mark all user notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  const updatedNotifications = await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId))
    .returning();

  return updatedNotifications;
};

// Delete notification
export const deleteNotification = async (notificationId: string) => {
  const [notification] = await db
    .delete(notifications)
    .where(eq(notifications.id, notificationId))
    .returning();

  return notification;
};

// Get notification count
export const getNotificationCount = async (userId: string) => {
  const notification = await db
    .select({ count: notifications.id })
    .from(notifications)
    .where(eq(notifications.userId, userId));

  return notification.length;
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string) => {
  const unreadNotifications = await db
    .select({ count: notifications.id })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false))
    );

  return unreadNotifications.length;
};
