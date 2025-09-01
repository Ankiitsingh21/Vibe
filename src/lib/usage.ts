import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "./db";
import { auth } from "@clerk/nextjs/server";

export async function getUsageTracker() {

        const {has} = await auth();
        const hasPremiumAccess = has({plan:"pro"})
        console.log(hasPremiumAccess);
  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "Usage",
    points: !hasPremiumAccess?5:100, // total free credits
    duration: 30 * 24 * 60 * 60, // 30 days
  });
  return usageTracker;
}

// ✅ Consume 1 credit
export async function consumeCredits() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.consume(userId, 1);

  return {
    remainingPoints: result.remainingPoints,
    msBeforeNext: result.msBeforeNext,
  };
}

// ✅ Just check status (don’t consume)
export async function getUsageStatus() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.get(userId);

  if (!result) {
    // User has never consumed → full quota
    return {
      remainingPoints: usageTracker.points,
      msBeforeNext: 0,
    };
  }

  return {
    remainingPoints: result.remainingPoints,
    msBeforeNext: result.msBeforeNext,
  };
}
