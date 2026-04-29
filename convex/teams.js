import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTeam = mutation({
  args: { name: v.string(), ward: v.string() },
  handler: async (ctx, args) => {
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      ward: args.ward,
      clickCount: 0,
    });
    return teamId;
  },
});

export const getTeams = query({
  handler: async (ctx) => {
    return await ctx.db.query("teams").collect();
  },
});

export const getTeamById = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.teamId);
  },
});

export const incrementClick = mutation({
  args: { 
    teamId: v.optional(v.id("teams")), 
    userId: v.optional(v.id("users")) 
  },
  handler: async (ctx, args) => {
    // 1. Increment Team count if provided
    if (args.teamId) {
      const team = await ctx.db.get(args.teamId);
      if (team) {
        await ctx.db.patch(args.teamId, {
          clickCount: team.clickCount + 1,
        });
      }
    }

    // 2. Increment User count if provided
    if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (user) {
        await ctx.db.patch(args.userId, {
          clickCount: (user.clickCount || 0) + 1,
        });
      }
    }

    // 3. Record individual click event for analytics
    if (args.teamId && args.userId) {
      await ctx.db.insert("clicks", {
        userId: args.userId,
        teamId: args.teamId,
        timestamp: Date.now(),
      });
    }
  },
});
