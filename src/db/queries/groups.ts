import { eq, desc, asc, like, and, or } from "drizzle-orm";
import { db } from "../db";
import { groups, users, groupMembers } from "../schema";

// Get all groups with pagination
export const getAllGroups = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const allGroups = await db
    .select({
      group: groups,
      creator: users
    })
    .from(groups)
    .innerJoin(users, eq(groups.createdBy, users.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(groups.createdAt));

  const totalCount = await db
    .select({ count: groups.id })
    .from(groups);

  return {
    groups: allGroups,
    pagination: {
      page,
      limit,
      total: totalCount.length,
      totalPages: Math.ceil(totalCount.length / limit)
    }
  };
};

// Get group by ID with creator and members
export const getGroupById = async (groupId: string) => {
  const [group] = await db
    .select({
      group: groups,
      creator: users
    })
    .from(groups)
    .innerJoin(users, eq(groups.createdBy, users.id))
    .where(eq(groups.id, groupId));

  if (!group) return null;

  // Get members
  const members = await db
    .select({
      user: users,
      joinedAt: groupMembers.joinedAt
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(desc(groupMembers.joinedAt));

  return {
    ...group,
    members
  };
};

// Create new group
export const createGroup = async (groupData: {
  name: string;
  createdBy: string;
}) => {
  const [group] = await db
    .insert(groups)
    .values(groupData)
    .returning();

  return group;
};

// Update group
export const updateGroup = async (
  groupId: string,
  updateData: Partial<{
    name: string;
  }>
) => {
  const [updatedGroup] = await db
    .update(groups)
    .set(updateData)
    .where(eq(groups.id, groupId))
    .returning();

  return updatedGroup;
};

// Delete group
export const deleteGroup = async (groupId: string) => {
  const [deletedGroup] = await db
    .delete(groups)
    .where(eq(groups.id, groupId))
    .returning();

  return deletedGroup;
};

// Search groups
export const searchGroups = async (query: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const searchResults = await db
    .select({
      group: groups,
      creator: users
    })
    .from(groups)
    .innerJoin(users, eq(groups.createdBy, users.id))
    .where(like(groups.name, `%${query}%`))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(groups.createdAt));

  return searchResults;
};

// Join group
export const joinGroup = async (userId: string, groupId: string) => {
  const [membership] = await db
    .insert(groupMembers)
    .values({
      userId,
      groupId
    })
    .returning();

  return membership;
};

// Leave group
export const leaveGroup = async (userId: string, groupId: string) => {
  const [membership] = await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
    .returning();

  return membership;
};

// Check if user is member of group
export const isUserMember = async (userId: string, groupId: string) => {
  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)));

  return !!membership;
};

// Get group members
export const getGroupMembers = async (groupId: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const members = await db
    .select({
      user: users,
      joinedAt: groupMembers.joinedAt
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(groupMembers.joinedAt));

  return members;
};

// Get groups created by user
export const getGroupsByCreator = async (creatorId: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const creatorGroups = await db
    .select()
    .from(groups)
    .where(eq(groups.createdBy, creatorId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(groups.createdAt));

  return creatorGroups;
};

// Get user's groups (groups they're member of)
export const getUserGroups = async (userId: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const userGroups = await db
    .select({
      group: groups,
      joinedAt: groupMembers.joinedAt
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(groupMembers.joinedAt));

  return userGroups;
}; 