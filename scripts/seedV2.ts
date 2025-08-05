import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";
import * as schema from "../src/db/schema";
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
import { reset } from "drizzle-seed";
// Simple data generation functions (no external dependencies)
const generateName = () => {
  const firstNames = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
    "Ivy",
    "Jack",
    "Kate",
    "Liam",
    "Mia",
    "Noah",
    "Olivia",
    "Paul",
    "Quinn",
    "Ruby",
    "Sam",
    "Tara",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
  ];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateEmail = (name: string) => {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "example.com",
  ];
  const username =
    name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
  return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateUsername = (name: string) => {
  return (
    name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000)
  );
};

const generateBio = () => {
  const bios = [
    "Passionate about connecting people through events",
    "Event enthusiast and community builder",
    "Love organizing meetups and gatherings",
    "Always looking for new experiences",
    "Community-driven individual",
    "Event planning is my passion",
    "Bringing people together one event at a time",
    "Local event explorer",
    "Social butterfly and event lover",
    "Creating memorable experiences",
  ];
  return bios[Math.floor(Math.random() * bios.length)];
};

const generateEventTitle = () => {
  const titles = [
    "Tech Meetup 2024",
    "Local Art Exhibition",
    "Community Garden Workshop",
    "Music Festival",
    "Book Club Meeting",
    "Fitness Bootcamp",
    "Cooking Class",
    "Photography Workshop",
    "Startup Networking",
    "Yoga Session",
    "Language Exchange",
    "Board Game Night",
    "Wine Tasting",
    "Hiking Adventure",
    "Coding Workshop",
  ];
  return titles[Math.floor(Math.random() * titles.length)];
};

const generateEventDescription = () => {
  const descriptions = [
    "Join us for an exciting event where we'll explore new ideas and connect with like-minded individuals.",
    "A fantastic opportunity to learn, grow, and build meaningful relationships in our community.",
    "Experience something unique and memorable with fellow enthusiasts in your area.",
    "Come together for an afternoon of fun, learning, and great conversations.",
    "An event designed to bring people together and create lasting connections.",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const generateLocation = () => {
  const cities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
  ];
  const states = ["NY", "CA", "IL", "TX", "AZ", "PA", "FL", "OH", "GA", "NC"];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  return `${city}, ${state}`;
};

const generateGroupName = () => {
  const names = [
    "Tech Enthusiasts",
    "Art Lovers",
    "Fitness Community",
    "Book Club",
    "Music Makers",
    "Foodies United",
    "Photography Group",
    "Startup Founders",
    "Yoga Collective",
    "Language Learners",
    "Gamers Guild",
    "Wine Connoisseurs",
  ];
  return names[Math.floor(Math.random() * names.length)];
};

const generateComment = () => {
  const comments = [
    "Great event! Had a wonderful time meeting everyone.",
    "Really enjoyed the atmosphere and the people.",
    "Amazing experience, would definitely attend again.",
    "Well organized and very informative.",
    "Loved the energy and the activities.",
    "Fantastic community event!",
    "Highly recommend to others.",
    "Great networking opportunity.",
    "Wonderful experience overall.",
    "Looking forward to the next one!",
  ];
  return comments[Math.floor(Math.random() * comments.length)];
};

const generateNotificationContent = () => {
  const contents = [
    "You have a new event invitation",
    "Someone followed you",
    "New event in your area",
    "Your event was reviewed",
    "New member joined your group",
    "Event reminder: tomorrow at 2 PM",
    "Your verification request was approved",
    "New activity in your groups",
    "Someone commented on your event",
    "Welcome to LocalEve!",
  ];
  return contents[Math.floor(Math.random() * contents.length)];
};

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
  await reset(db, schema);
  console.log("👍 Cleared database");
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Create Users (20 users)
    console.log("Creating users...");
    const userData = Array.from({ length: 20 }, () => {
      const name = generateName();
      return {
        name,
        email: generateEmail(name),
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        username: generateUsername(name),
        bio: generateBio(),
      };
    });

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${createdUsers.length} users`);

    // 2. Create Accounts (for all users)
    console.log("Creating accounts...");
    const accountData = createdUsers.map((user) => ({
      userId: user.id,
      provider: "google",
      providerAccountId: Math.random().toString(36).substring(2, 23),
    }));

    await db.insert(accounts).values(accountData);
    console.log(`✅ Created ${accountData.length} accounts`);

    // 3. Create Events (15 events)
    console.log("Creating events...");

    // Define interest categories as simple strings
    const interestCategories = [
      "Music & Audio",
      "Coffee & Chat",
      "Arts & Crafts",
      "Photography",
      "Books & Poetry",
      "Games & Sports",
      "Food & Cooking",
      "Tech & Innovation",
      "Fitness & Wellness",
      "Social Impact",
      "Music Production",
      "Business & Career",
      "Learning & Education",
      "Outdoor Adventures",
      "Nightlife & Entertainment",
      "Community Building",
    ];

    const eventData = Array.from({ length: 15 }, () => ({
      title: generateEventTitle(),
      description: generateEventDescription(),
      date: getRandomDate(
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ), // Next 30 days
      location: generateLocation(),
      organizerId:
        createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
      interests: getRandomItems(
        interestCategories,
        Math.floor(Math.random() * 3) + 1
      ), // 1-3 random interests
    }));

    const createdEvents = await db.insert(events).values(eventData).returning();
    console.log(`✅ Created ${createdEvents.length} events`);

    // 4. Create Groups (12 groups)
    console.log("Creating groups...");
    const groupData = Array.from({ length: 12 }, () => ({
      name: generateGroupName(),
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
      comment: generateComment(),
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
      content: generateNotificationContent(),
      read: Math.random() > 0.5, // 50% chance of being read
    }));

    await db.insert(notifications).values(notificationData);
    console.log(`✅ Created ${notificationData.length} notifications`);

    // 10. Create Verification Requests (15 requests)
    console.log("Creating verification requests...");
    const verificationData = Array.from({ length: 15 }, () => ({
      userId: createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
      documentUrl: `https://example.com/documents/${Math.random().toString(36).substring(2, 15)}.pdf`,
      status: getRandomItems(["pending", "approved", "rejected"], 1)[0],
      reviewedBy:
        Math.random() > 0.3
          ? createdUsers[Math.floor(Math.random() * createdUsers.length)].id
          : null,
      notes: Math.random() > 0.5 ? "Verification request processed" : null,
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
