import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";
import {
  users,
  accounts,
  events,
  eventParticipants,
  groups,
  groupMembers,
  eventReviews,
  follows,
  notifications,
  verificationRequests,
} from "../src/db/schema";
import { faker } from "@faker-js/faker";

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const db = drizzle(pool, { casing: "snake_case" });

// Helper function to generate random dates
const getRandomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper function to get random items from array
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (optional - uncomment if you want to start fresh)
    // await db.delete(eventReviews);
    // await db.delete(eventParticipants);
    // await db.delete(groupMembers);
    // await db.delete(follows);
    // await db.delete(notifications);
    // await db.delete(verificationRequests);
    // await db.delete(events);
    // await db.delete(groups);
    // await db.delete(accounts);
    // await db.delete(users);

    // 1. Create Users (20 users)
    console.log("Creating users...");
    const userData = Array.from({ length: 20 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      image: faker.image.avatar(),
      username: faker.internet.userName(),
      bio: faker.lorem.sentence(),
    }));

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${createdUsers.length} users`);

    // 2. Create Accounts (for all users)
    console.log("Creating accounts...");
    const accountData = createdUsers.map((user) => ({
      userId: user.id,
      provider: "google",
      providerAccountId: faker.string.alphanumeric(21),
    }));

    await db.insert(accounts).values(accountData);
    console.log(`✅ Created ${accountData.length} accounts`);

    // 3. Create Events (15 events)
    console.log("Creating events...");
    const eventData = Array.from({ length: 15 }, () => ({
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      date: getRandomDate(
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ), // Next 30 days
      location: faker.location.city() + ", " + faker.location.state(),
      organizerId:
        createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
    }));

    const createdEvents = await db.insert(events).values(eventData).returning();
    console.log(`✅ Created ${createdEvents.length} events`);

    // 4. Create Groups (12 groups)
    console.log("Creating groups...");
    const groupData = Array.from({ length: 12 }, () => ({
      name: faker.company.name(),
      createdBy:
        createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
    }));

    const createdGroups = await db.insert(groups).values(groupData).returning();
    console.log(`✅ Created ${createdGroups.length} groups`);

    // 5. Create Event Participants (30 participations)
    console.log("Creating event participants...");
    const participantData: { userId: string; eventId: string }[] = [];
    for (let i = 0; i < 30; i++) {
      const userId =
        createdUsers[Math.floor(Math.random() * createdUsers.length)].id;
      const eventId =
        createdEvents[Math.floor(Math.random() * createdEvents.length)].id;

      // Avoid duplicates
      const exists = participantData.some(
        (p) => p.userId === userId && p.eventId === eventId
      );

      if (!exists) {
        participantData.push({
          userId,
          eventId,
        });
      }
    }

    await db.insert(eventParticipants).values(participantData);
    console.log(`✅ Created ${participantData.length} event participants`);

    // 6. Create Group Members (40 memberships)
    console.log("Creating group members...");
    const memberData: { userId: string; groupId: string }[] = [];
    for (let i = 0; i < 40; i++) {
      const userId =
        createdUsers[Math.floor(Math.random() * createdUsers.length)].id;
      const groupId =
        createdGroups[Math.floor(Math.random() * createdGroups.length)].id;

      // Avoid duplicates
      const exists = memberData.some(
        (m) => m.userId === userId && m.groupId === groupId
      );

      if (!exists) {
        memberData.push({
          userId,
          groupId,
        });
      }
    }

    await db.insert(groupMembers).values(memberData);
    console.log(`✅ Created ${memberData.length} group members`);

    // 7. Create Event Reviews (25 reviews)
    console.log("Creating event reviews...");
    const reviewData = Array.from({ length: 25 }, () => ({
      eventId:
        createdEvents[Math.floor(Math.random() * createdEvents.length)].id,
      userId: createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
      rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
      comment: faker.lorem.paragraph(),
    }));

    await db.insert(eventReviews).values(reviewData);
    console.log(`✅ Created ${reviewData.length} event reviews`);

    // 8. Create Follows (35 follows)
    console.log("Creating follows...");
    const followData: { followerId: string; followingId: string }[] = [];
    for (let i = 0; i < 35; i++) {
      const followerId =
        createdUsers[Math.floor(Math.random() * createdUsers.length)].id;
      const followingId =
        createdUsers[Math.floor(Math.random() * createdUsers.length)].id;

      // Avoid self-follows and duplicates
      const exists = followData.some(
        (f) => f.followerId === followerId && f.followingId === followingId
      );

      if (followerId !== followingId && !exists) {
        followData.push({
          followerId,
          followingId,
        });
      }
    }

    await db.insert(follows).values(followData);
    console.log(`✅ Created ${followData.length} follows`);

    // 9. Create Notifications (30 notifications)
    console.log("Creating notifications...");
    const notificationData = Array.from({ length: 30 }, () => ({
      userId: createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
      content: faker.lorem.sentence(),
      read: Math.random() > 0.5, // 50% chance of being read
    }));

    await db.insert(notifications).values(notificationData);
    console.log(`✅ Created ${notificationData.length} notifications`);

    // 10. Create Verification Requests (15 requests)
    console.log("Creating verification requests...");
    const verificationData = Array.from({ length: 15 }, () => ({
      userId: createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
      documentUrl: faker.internet.url(),
      status: getRandomItems(["pending", "approved", "rejected"], 1)[0],
      reviewedBy:
        Math.random() > 0.3
          ? createdUsers[Math.floor(Math.random() * createdUsers.length)].id
          : null,
      notes: Math.random() > 0.5 ? faker.lorem.sentence() : null,
    }));

    await db.insert(verificationRequests).values(verificationData);
    console.log(`✅ Created ${verificationData.length} verification requests`);

    console.log("🎉 Database seeding completed successfully!");

    // Print summary
    console.log("\n📊 Seeding Summary:");
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Accounts: ${accountData.length}`);
    console.log(`- Events: ${createdEvents.length}`);
    console.log(`- Groups: ${createdGroups.length}`);
    console.log(`- Event Participants: ${participantData.length}`);
    console.log(`- Group Members: ${memberData.length}`);
    console.log(`- Event Reviews: ${reviewData.length}`);
    console.log(`- Follows: ${followData.length}`);
    console.log(`- Notifications: ${notificationData.length}`);
    console.log(`- Verification Requests: ${verificationData.length}`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function
seed().catch((error) => {
  console.error("Failed to seed database:", error);
  process.exit(1);
});
