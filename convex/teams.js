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

export const updateTeam = mutation({
  args: { 
    teamId: v.id("teams"), 
    name: v.string(), 
    ward: v.string() 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.teamId, {
      name: args.name,
      ward: args.ward,
    });
  },
});

export const deleteTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    // Optionally delete all members of this team first
    const members = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete all clicks associated with this team
    const clicks = await ctx.db
      .query("clicks")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    
    for (const click of clicks) {
      await ctx.db.delete(click._id);
    }

    // Delete targets
    const targets = await ctx.db
      .query("targets")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    
    for (const target of targets) {
      await ctx.db.delete(target._id);
    }

    await ctx.db.delete(args.teamId);
  },
});

export const getGlobalStats = query({
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const totalClicks = teams.reduce((acc, team) => acc + (team.clickCount || 0), 0);
    const totalTeams = teams.length;
    const uniqueWards = new Set(teams.map((t) => t.ward)).size;

    // Calculate trend
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;

    const recentClicks = await ctx.db
      .query("clicks")
      .withIndex("by_timestamp", (q) => q.gt("timestamp", twentyFourHoursAgo))
      .collect();

    const previousClicks = await ctx.db
      .query("clicks")
      .withIndex("by_timestamp", (q) => 
        q.gt("timestamp", fortyEightHoursAgo).lt("timestamp", twentyFourHoursAgo)
      )
      .collect();

    const recentCount = recentClicks.length;
    const previousCount = previousClicks.length;

    let trend = 0;
    if (previousCount > 0) {
      trend = Math.round(((recentCount - previousCount) / previousCount) * 100);
    } else if (recentCount > 0) {
      trend = 100;
    }

    return {
      totalClicks,
      totalTeams,
      uniqueWards,
      clickTrend: trend >= 0 ? `+${trend}%` : `${trend}%`,
      recentCount
    };
  },
});
