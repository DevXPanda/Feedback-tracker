import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTarget = mutation({
  args: {
    target: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    teamId: v.optional(v.id("teams")),
    userId: v.optional(v.id("users")),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Delete existing overlapping targets for the same scope if desired, 
    // or just insert a new one. For simplicity, we insert.
    return await ctx.db.insert("targets", {
      target: args.target,
      startDate: args.startDate,
      endDate: args.endDate,
      teamId: args.teamId,
      userId: args.userId,
      label: args.label,
    });
  },
});

export const getActiveTarget = query({
  args: {
    userId: v.optional(v.id("users")),
    teamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find targets where now is between startDate and endDate
    // We'll look for user-specific target first, then team target
    let target = null;
    
    if (args.userId) {
      target = await ctx.db
        .query("targets")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.and(
          q.gte(q.field("endDate"), now),
          q.lte(q.field("startDate"), now)
        ))
        .first();
    }
    
    if (!target && args.teamId) {
      target = await ctx.db
        .query("targets")
        .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
        .filter((q) => q.and(
          q.gte(q.field("endDate"), now),
          q.lte(q.field("startDate"), now)
        ))
        .first();
    }
    
    if (!target) return null;

    // Calculate progress
    let count = 0;
    if (target.userId) {
      const clicks = await ctx.db
        .query("clicks")
        .withIndex("by_user", (q) => q.eq("userId", target.userId))
        .filter((q) => q.and(
          q.gte(q.field("timestamp"), target.startDate),
          q.lte(q.field("timestamp"), target.endDate)
        ))
        .collect();
      count = clicks.length;
    } else if (target.teamId) {
      const clicks = await ctx.db
        .query("clicks")
        .withIndex("by_team", (q) => q.eq("teamId", target.teamId))
        .filter((q) => q.and(
          q.gte(q.field("timestamp"), target.startDate),
          q.lte(q.field("timestamp"), target.endDate)
        ))
        .collect();
      count = clicks.length;
    }

    return {
      ...target,
      current: count,
      percentage: Math.min(Math.round((count / target.target) * 100), 100),
    };
  },
});
