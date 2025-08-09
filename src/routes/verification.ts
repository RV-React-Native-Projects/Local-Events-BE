import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { requireAuth, optionalAuth } from "../middleware/auth";
import "../types/hono";
import {
  getAllVerificationRequests,
  getVerificationRequestById,
  getUserVerificationRequests,
  createVerificationRequest,
  updateVerificationRequest,
  approveVerificationRequest,
  rejectVerificationRequest,
  deleteVerificationRequest,
  getPendingVerificationRequests,
  getVerificationRequestsByStatus,
  hasPendingVerificationRequest,
} from "../db/queries/verification";

const verification = new Hono();

// Validation schemas
const createVerificationRequestSchema = z.object({
  userId: z.string().uuid(),
  documentUrl: z.string().url().max(500),
  notes: z.string().optional(),
});

const updateVerificationRequestSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  reviewedBy: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const approveRejectSchema = z.object({
  reviewerId: z.string().uuid(),
  notes: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
});

// GET /verification - Get all verification requests (admin)
verification.get("/", zValidator("query", paginationSchema), async (c) => {
  try {
    const query = c.req.valid("query");
    const page = query.page || 1;
    const limit = query.limit || 10;
    const requests = await getAllVerificationRequests(page, limit);

    return c.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch verification requests" },
      500
    );
  }
});

// GET /verification/pending - Get pending verification requests
verification.get(
  "/pending",
  zValidator("query", paginationSchema),
  async (c) => {
    try {
      const query = c.req.valid("query");
      const page = query.page || 1;
      const limit = query.limit || 10;
      const requests = await getPendingVerificationRequests(page, limit);

      return c.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to fetch pending requests" },
        500
      );
    }
  }
);

// GET /verification/status/:status - Get requests by status
verification.get(
  "/status/:status",
  zValidator("query", paginationSchema),
  async (c) => {
    try {
      const status = c.req.param("status");
      const query = c.req.valid("query");
      const page = query.page || 1;
      const limit = query.limit || 10;
      const requests = await getVerificationRequestsByStatus(
        status,
        page,
        limit
      );

      return c.json({
        success: true,
        data: requests,
        status,
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to fetch requests by status" },
        500
      );
    }
  }
);

// GET /verification/:id - Get verification request by ID
verification.get("/:id", async (c) => {
  try {
    const requestId = c.req.param("id");
    const request = await getVerificationRequestById(requestId);

    if (!request) {
      return c.json(
        { success: false, error: "Verification request not found" },
        404
      );
    }

    return c.json({
      success: true,
      data: request,
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to fetch verification request" },
      500
    );
  }
});

// GET /verification/user/:userId - Get user's verification requests
verification.get(
  "/user/:userId",
  zValidator("query", paginationSchema),
  async (c) => {
    try {
      const userId = c.req.param("userId");
      const query = c.req.valid("query");
      const page = query.page || 1;
      const limit = query.limit || 10;
      const requests = await getUserVerificationRequests(userId, page, limit);

      return c.json({
        success: true,
        data: requests,
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to fetch user verification requests" },
        500
      );
    }
  }
);

// POST /verification - Create verification request
verification.post(
  "/",
  requireAuth,
  zValidator("json", createVerificationRequestSchema),
  async (c) => {
    try {
      const requestData = c.req.valid("json");

      // Check if user already has a pending request
      const hasPending = await hasPendingVerificationRequest(
        requestData.userId
      );
      if (hasPending) {
        return c.json(
          {
            success: false,
            error: "User already has a pending verification request",
          },
          400
        );
      }

      const request = await createVerificationRequest(requestData);

      return c.json(
        {
          success: true,
          data: request,
        },
        201
      );
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to create verification request" },
        500
      );
    }
  }
);

// PUT /verification/:id - Update verification request
verification.put(
  "/:id",
  requireAuth,
  zValidator("json", updateVerificationRequestSchema),
  async (c) => {
    try {
      const requestId = c.req.param("id");
      const updateData = c.req.valid("json");

      // Check if request exists
      const existingRequest = await getVerificationRequestById(requestId);
      if (!existingRequest) {
        return c.json(
          { success: false, error: "Verification request not found" },
          404
        );
      }

      const request = await updateVerificationRequest(requestId, updateData);

      return c.json({
        success: true,
        data: request,
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to update verification request" },
        500
      );
    }
  }
);

// PUT /verification/:id/approve - Approve verification request
verification.put(
  "/:id/approve",
  requireAuth,
  zValidator("json", approveRejectSchema),
  async (c) => {
    try {
      const requestId = c.req.param("id");
      const { reviewerId, notes } = c.req.valid("json");

      const request = await approveVerificationRequest(
        requestId,
        reviewerId,
        notes
      );

      return c.json({
        success: true,
        data: request,
        message: "Verification request approved",
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to approve verification request" },
        500
      );
    }
  }
);

// PUT /verification/:id/reject - Reject verification request
verification.put(
  "/:id/reject",
  requireAuth,
  zValidator("json", approveRejectSchema),
  async (c) => {
    try {
      const requestId = c.req.param("id");
      const { reviewerId, notes } = c.req.valid("json");

      const request = await rejectVerificationRequest(
        requestId,
        reviewerId,
        notes
      );

      return c.json({
        success: true,
        data: request,
        message: "Verification request rejected",
      });
    } catch (error) {
      return c.json(
        { success: false, error: "Failed to reject verification request" },
        500
      );
    }
  }
);

// DELETE /verification/:id - Delete verification request
verification.delete("/:id", requireAuth, async (c) => {
  try {
    const requestId = c.req.param("id");

    // Check if request exists
    const existingRequest = await getVerificationRequestById(requestId);
    if (!existingRequest) {
      return c.json(
        { success: false, error: "Verification request not found" },
        404
      );
    }

    const request = await deleteVerificationRequest(requestId);

    return c.json({
      success: true,
      data: request,
      message: "Verification request deleted successfully",
    });
  } catch (error) {
    return c.json(
      { success: false, error: "Failed to delete verification request" },
      500
    );
  }
});

export { verification };
