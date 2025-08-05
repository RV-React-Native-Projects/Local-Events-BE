import { eq, desc, and } from "drizzle-orm";
import { db } from "../db";
import { verificationRequests, users } from "../schema";

// Get all verification requests (admin)
export const getAllVerificationRequests = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const allRequests = await db
    .select({
      request: verificationRequests,
      user: users,
      reviewer: users
    })
    .from(verificationRequests)
    .innerJoin(users, eq(verificationRequests.userId, users.id))
    .leftJoin(users, eq(verificationRequests.reviewedBy, users.id))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(verificationRequests.createdAt));

  return allRequests;
};

// Get verification request by ID
export const getVerificationRequestById = async (requestId: string) => {
  const [request] = await db
    .select({
      request: verificationRequests,
      user: users,
      reviewer: users
    })
    .from(verificationRequests)
    .innerJoin(users, eq(verificationRequests.userId, users.id))
    .leftJoin(users, eq(verificationRequests.reviewedBy, users.id))
    .where(eq(verificationRequests.id, requestId));

  return request;
};

// Get user's verification requests
export const getUserVerificationRequests = async (userId: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const userRequests = await db
    .select({
      request: verificationRequests,
      reviewer: users
    })
    .from(verificationRequests)
    .leftJoin(users, eq(verificationRequests.reviewedBy, users.id))
    .where(eq(verificationRequests.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(verificationRequests.createdAt));

  return userRequests;
};

// Create verification request
export const createVerificationRequest = async (requestData: {
  userId: string;
  documentUrl: string;
  notes?: string;
}) => {
  const [request] = await db
    .insert(verificationRequests)
    .values(requestData)
    .returning();

  return request;
};

// Update verification request
export const updateVerificationRequest = async (
  requestId: string,
  updateData: Partial<{
    status: string;
    reviewedBy: string;
    notes: string;
  }>
) => {
  const [request] = await db
    .update(verificationRequests)
    .set(updateData)
    .where(eq(verificationRequests.id, requestId))
    .returning();

  return request;
};

// Approve verification request
export const approveVerificationRequest = async (requestId: string, reviewerId: string, notes?: string) => {
  const [request] = await db
    .update(verificationRequests)
    .set({
      status: "approved",
      reviewedBy: reviewerId,
      notes: notes || "Request approved"
    })
    .where(eq(verificationRequests.id, requestId))
    .returning();

  return request;
};

// Reject verification request
export const rejectVerificationRequest = async (requestId: string, reviewerId: string, notes?: string) => {
  const [request] = await db
    .update(verificationRequests)
    .set({
      status: "rejected",
      reviewedBy: reviewerId,
      notes: notes || "Request rejected"
    })
    .where(eq(verificationRequests.id, requestId))
    .returning();

  return request;
};

// Delete verification request
export const deleteVerificationRequest = async (requestId: string) => {
  const [request] = await db
    .delete(verificationRequests)
    .where(eq(verificationRequests.id, requestId))
    .returning();

  return request;
};

// Get pending verification requests
export const getPendingVerificationRequests = async (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const pendingRequests = await db
    .select({
      request: verificationRequests,
      user: users
    })
    .from(verificationRequests)
    .innerJoin(users, eq(verificationRequests.userId, users.id))
    .where(eq(verificationRequests.status, "pending"))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(verificationRequests.createdAt));

  return pendingRequests;
};

// Get verification requests by status
export const getVerificationRequestsByStatus = async (status: string, page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit;
  
  const statusRequests = await db
    .select({
      request: verificationRequests,
      user: users,
      reviewer: users
    })
    .from(verificationRequests)
    .innerJoin(users, eq(verificationRequests.userId, users.id))
    .leftJoin(users, eq(verificationRequests.reviewedBy, users.id))
    .where(eq(verificationRequests.status, status))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(verificationRequests.createdAt));

  return statusRequests;
};

// Check if user has pending verification request
export const hasPendingVerificationRequest = async (userId: string) => {
  const [request] = await db
    .select()
    .from(verificationRequests)
    .where(and(eq(verificationRequests.userId, userId), eq(verificationRequests.status, "pending")));

  return !!request;
}; 