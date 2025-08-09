import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth, optionalAuth } from "../middleware/auth";
import "../types/hono";
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  searchGroups,
  joinGroup,
  leaveGroup,
  isUserMember,
  getGroupMembers,
  getGroupsByCreator,
  getUserGroups,
} from "../db/queries/groups";

const groups = new Hono();

// Validation schemas
const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  createdBy: z.string().uuid(),
});

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

const searchSchema = z.object({
  q: z.string().min(1),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
});

// GET /groups - Get all groups with pagination
groups.get("/", zValidator("query", paginationSchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const page = query.page || 1;
    const limit = query.limit || 10;
    const result = await getAllGroups(page, limit);

    return c.json({
      success: true,
      data: result.groups,
      pagination: result.pagination,
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch groups" }, 500);
  }
});

// GET /groups/search - Search groups
groups.get("/search", zValidator("query", searchSchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const q = query.q;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const results = await searchGroups(q, page, limit);

    return c.json({
      success: true,
      data: results,
      query: q,
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to search groups" }, 500);
  }
});

// GET /groups/:id - Get group by ID
groups.get("/:id", async (c) => {
  try {
    const groupId = c.req.param("id");
    const group = await getGroupById(groupId);

    if (!group) {
      return c.json({ success: false, error: "Group not found" }, 404);
    }

    return c.json({
      success: true,
      data: group,
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch group" }, 500);
  }
});

// GET /groups/:id/members - Get group members
groups.get("/:id/members", zValidator("query", paginationSchema), async (c) => {
  try {
    const groupId = c.req.param("id");
    const query = c.req.valid("query");
    const page = query.page || 1;
    const limit = query.limit || 10;
    const members = await getGroupMembers(groupId, page, limit);

    return c.json({
      success: true,
      data: members,
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch group members" },
      500
    );
  }
});

// POST /groups - Create new group
groups.post(
  "/",
  requireAuth,
  zValidator("json", createGroupSchema),
  async (c) => {
    try {
      const groupData = c.req.valid("json");
      const group = await createGroup(groupData);

      return c.json(
        {
          success: true,
          data: group,
        },
        201
      );
    } catch (error) {
      return c.json({ success: false, error: "Failed to create group" }, 500);
    }
  }
);

// PUT /groups/:id - Update group
groups.put(
  "/:id",
  requireAuth,
  zValidator("json", updateGroupSchema),
  async (c) => {
    try {
      const groupId = c.req.param("id");
      const updateData = c.req.valid("json");

      // Check if group exists
      const existingGroup = await getGroupById(groupId);
      if (!existingGroup) {
        return c.json({ success: false, error: "Group not found" }, 404);
      }

      const updatedGroup = await updateGroup(groupId, updateData);

      return c.json({
        success: true,
        data: updatedGroup,
      });
    } catch (error) {
      return c.json({ success: false, error: "Failed to update group" }, 500);
    }
  }
);

// DELETE /groups/:id - Delete group
groups.delete("/:id", requireAuth, async (c) => {
  try {
    const groupId = c.req.param("id");

    // Check if group exists
    const existingGroup = await getGroupById(groupId);
    if (!existingGroup) {
      return c.json({ success: false, error: "Group not found" }, 404);
    }

    const deletedGroup = await deleteGroup(groupId);

    return c.json({
      success: true,
      data: deletedGroup,
      message: "Group deleted successfully",
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to delete group" }, 500);
  }
});

// POST /groups/:id/join - Join group
groups.post("/:id/join", requireAuth, async (c) => {
  try {
    const groupId = c.req.param("id");
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: "User ID is required" }, 400);
    }

    // Check if already a member
    const isMember = await isUserMember(userId, groupId);
    if (isMember) {
      return c.json(
        { success: false, error: "Already a member of this group" },
        400
      );
    }

    const membership = await joinGroup(userId, groupId);

    return c.json({
      success: true,
      data: membership,
      message: "Successfully joined group",
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to join group" }, 500);
  }
});

// DELETE /groups/:id/leave - Leave group
groups.delete("/:id/leave", requireAuth, async (c) => {
  try {
    const groupId = c.req.param("id");
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ success: false, error: "User ID is required" }, 400);
    }

    const membership = await leaveGroup(userId, groupId);

    return c.json({
      success: true,
      data: membership,
      message: "Successfully left group",
    });
  } catch (error) {
    return c.json({ success: false, error: "Failed to leave group" }, 500);
  }
});

export { groups };
