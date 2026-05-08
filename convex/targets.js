import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTarget = mutation({
  args: {
    target: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    teamId: v.optional(v.id("teams")),
    teamMemberId: v.optional(v.id("teamMembers")),
    userId: v.optional(v.id("users")),
    ulbId: v.id("ulbs"),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let adminId = args.userId; // Legacy
    
    if (args.teamMemberId) {
      const member = await ctx.db.get(args.teamMemberId);
      if (member) adminId = member.adminId;
    }

    return await ctx.db.insert("targets", {
      target: args.target,
      startDate: args.startDate,
      endDate: args.endDate,
      teamId: args.teamId,
      teamMemberId: args.teamMemberId,
      userId: args.userId,
      ulbId: args.ulbId,
      adminId: adminId,
      label: args.label,
    });
  },
});

export const getActiveTarget = query({
  args: {
    teamMemberId: v.optional(v.id("teamMembers")),
    userId: v.optional(v.id("users")),
    teamId: v.optional(v.id("teams")),
    ulbId: v.id("ulbs"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let target = null;
    
    if (args.teamMemberId) {
      target = await ctx.db
        .query("targets")
        .withIndex("by_team_member", (q) => q.eq("teamMemberId", args.teamMemberId))
        .filter((q) => q.and(
          q.eq(q.field("ulbId"), args.ulbId),
          q.gte(q.field("endDate"), now),
          q.lte(q.field("startDate"), now)
        ))
        .first();
    } else if (args.userId) {
      target = await ctx.db
        .query("targets")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.and(
          q.eq(q.field("ulbId"), args.ulbId),
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
          q.eq(q.field("ulbId"), args.ulbId),
          q.gte(q.field("endDate"), now),
          q.lte(q.field("startDate"), now)
        ))
        .first();
    }
    
    if (!target) return null;

    // Calculate progress
    let count = 0;
    if (target.teamMemberId) {
      const clicks = await ctx.db
        .query("clicks")
        .withIndex("by_team_member", (q) => q.eq("teamMemberId", target.teamMemberId))
        .filter((q) => q.and(
          q.gte(q.field("timestamp"), target.startDate),
          q.lte(q.field("timestamp"), target.endDate)
        ))
        .collect();
      count = clicks.length;
    } else if (target.userId) {
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
