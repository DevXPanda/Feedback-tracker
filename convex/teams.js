import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    const teams = await ctx.db.query("teams").collect();
    const now = Date.now();
    const startOfToday = new Date().setHours(0, 0, 0, 0);

    return await Promise.all(
      teams.map(async (team) => {
        const members = await ctx.db
          .query("users")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .filter((q) => q.eq(q.field("role"), "team"))
          .collect();

        const memberSummary = await Promise.all(
          members.map(async (member) => {
            const todayClicks = await ctx.db
              .query("clicks")
              .withIndex("by_user", (q) => q.eq("userId", member._id))
              .filter((q) => q.gte(q.field("timestamp"), startOfToday))
              .collect();

            const target = await ctx.db
              .query("targets")
              .withIndex("by_user", (q) => q.eq("userId", member._id))
              .filter((q) => q.and(
                q.gte(q.field("endDate"), now),
                q.lte(q.field("startDate"), now)
              ))
              .first();

            return {
              _id: member._id,
              name: member.name,
              total: member.clickCount || 0,
              today: todayClicks.length,
              target: target ? target.target : null,
            };
          })
        );

        return {
          ...team,
          memberSummary,
        };
      })
    );
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
    userId: v.optional(v.id("users")),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    source: v.string()
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
        lat: args.lat,
        lng: args.lng,
        source: args.source,
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
    const users = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "team")).collect();
    const totalClicks = users.reduce((acc, user) => acc + (user.clickCount || 0), 0);
    const totalMembers = users.length;

    // Calculate trend & Today's feedback
    const now = Date.now();
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;

    const todayClicks = await ctx.db
      .query("clicks")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", startOfToday))
      .collect();

    const previousClicks = await ctx.db
      .query("clicks")
      .withIndex("by_timestamp", (q) => 
        q.gt("timestamp", fortyEightHoursAgo).lt("timestamp", twentyFourHoursAgo)
      )
      .collect();

    const todayCount = todayClicks.length;
    const previousCount = previousClicks.length;

    let trend = 0;
    if (previousCount > 0) {
      trend = Math.round(((todayCount - previousCount) / previousCount) * 100);
    } else if (todayCount > 0) {
      trend = 100;
    }

    // Calculate Targets
    const activeTargets = await ctx.db
      .query("targets")
      .filter((q) => q.and(
        q.gte(q.field("endDate"), now),
        q.lte(q.field("startDate"), now)
      ))
      .collect();

    let totalTarget = 0;
    let targetAchievement = 0;

    for (const target of activeTargets) {
      totalTarget += target.target;
      if (target.userId) {
        const clicks = await ctx.db
          .query("clicks")
          .withIndex("by_user", (q) => q.eq("userId", target.userId))
          .filter((q) => q.and(
            q.gte(q.field("timestamp"), target.startDate),
            q.lte(q.field("timestamp"), target.endDate)
          ))
          .collect();
        targetAchievement += clicks.length;
      }
    }

    return {
      totalClicks,
      totalMembers,
      todayCount,
      totalTarget,
      targetAchievement,
      clickTrend: trend >= 0 ? `+${trend}%` : `${trend}%`,
    };
  },
});

export const getDetailedLogs = query({
  args: { 
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let clicksQuery = ctx.db.query("clicks");

    if (args.teamId) {
      clicksQuery = clicksQuery.withIndex("by_team", (q) => q.eq("teamId", args.teamId));
    } else if (args.userId) {
      clicksQuery = clicksQuery.withIndex("by_user", (q) => q.eq("userId", args.userId));
    }

    if (args.startDate) {
      clicksQuery = clicksQuery.filter((q) => q.gte(q.field("timestamp"), args.startDate));
    }
    if (args.endDate) {
      clicksQuery = clicksQuery.filter((q) => q.lte(q.field("timestamp"), args.endDate));
    }

    const clicks = await clicksQuery.order("desc").take(args.limit || 100);

    const logs = await Promise.all(
      clicks.map(async (click) => {
        const user = await ctx.db.get(click.userId);
        const team = await ctx.db.get(click.teamId);
        return {
          ...click,
          userName: user?.name || "Unknown",
          teamName: team?.name || "Unknown",
          ward: team?.ward || "Unknown",
        };
      })
    );

    return logs;
  },
});

export const getShareLinkAnalytics = query({
  handler: async (ctx) => {
    const clicks = await ctx.db.query("clicks").collect();
    const directCount = clicks.filter(c => c.source === "direct").length;
    const sharedCount = clicks.filter(c => c.source === "shared").length;
    
    return {
      directCount,
      sharedCount,
      total: clicks.length,
      sharedPercentage: clicks.length > 0 ? Math.round((sharedCount / clicks.length) * 100) : 0
    };
  }
});
export const getShareAnalyticsByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("users")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const analytics = await Promise.all(
      members.map(async (member) => {
        const clicks = await ctx.db
          .query("clicks")
          .withIndex("by_user", (q) => q.eq("userId", member._id))
          .collect();

        const direct = clicks.filter((c) => c.source === "direct").length;
        const shared = clicks.filter((c) => c.source === "shared").length;
        const total = clicks.length;

        return {
          memberId: member._id,
          memberName: member.name,
          direct,
          shared,
          total,
          sharedPercentage: total > 0 ? Math.round((shared / total) * 100) : 0,
        };
      })
    );

    return analytics;
  },
});
export const getMemberShareAnalytics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const clicks = await ctx.db
      .query("clicks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const direct = clicks.filter((c) => c.source === "direct").length;
    const shared = clicks.filter((c) => c.source === "shared").length;
    const total = clicks.length;

    return {
      direct,
      shared,
      total,
      sharedPercentage: total > 0 ? Math.round((shared / total) * 100) : 0,
    };
  },
});

// --- Delayed Tracking Logic ---

export const createPendingClick = mutation({
  args: {
    teamId: v.optional(v.id("teams")),
    userId: v.id("users"),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const pendingId = await ctx.db.insert("pendingClicks", {
      ...args,
      timestamp: Date.now(),
      lastHeartbeat: Date.now(),
    });

    // Schedule validation after 60 seconds
    await ctx.scheduler.runAfter(60000, api.teams.validatePendingClick, {
      pendingId,
    });

    return pendingId;
  },
});

export const updateVisitorHeartbeat = mutation({
  args: { pendingId: v.id("pendingClicks") },
  handler: async (ctx, args) => {
    const pending = await ctx.db.get(args.pendingId);
    if (pending) {
      await ctx.db.patch(args.pendingId, {
        lastHeartbeat: Date.now(),
      });
    }
  },
});

export const validatePendingClick = mutation({
  args: { pendingId: v.id("pendingClicks") },
  handler: async (ctx, args) => {
    const pending = await ctx.db.get(args.pendingId);
    if (!pending) return;

    const now = Date.now();
    // Session is valid if heartbeat is within last 15 seconds
    const isValid = now - pending.lastHeartbeat < 15000;

    if (isValid) {
      // Promote to real click
      if (pending.teamId) {
        const team = await ctx.db.get(pending.teamId);
        if (team) {
          await ctx.db.patch(pending.teamId, {
            clickCount: (team.clickCount || 0) + 1,
          });
        }
      }

      const user = await ctx.db.get(pending.userId);
      await ctx.db.patch(pending.userId, {
        clickCount: (user.clickCount || 0) + 1,
      });

      await ctx.db.insert("clicks", {
        userId: pending.userId,
        teamId: pending.teamId,
        timestamp: pending.timestamp,
        lat: pending.lat,
        lng: pending.lng,
        source: pending.source,
      });

      // --- Spam Detection Logic ---
      if (pending.lat && pending.lng) {
        const roundedLat = Math.round(pending.lat * 10000) / 10000;
        const roundedLng = Math.round(pending.lng * 10000) / 10000;

        const existingFlag = await ctx.db
          .query("locationFlags")
          .withIndex("by_location", (q) => 
            q.eq("userId", pending.userId).eq("lat", roundedLat).eq("lng", roundedLng)
          )
          .unique();

        if (existingFlag) {
          const newCount = existingFlag.count + 1;
          await ctx.db.patch(existingFlag._id, {
            count: newCount,
            // If it crosses threshold, mark as pending if it was cleared or nothing
            status: newCount > 10 && existingFlag.status !== "problem" ? "pending" : existingFlag.status
          });
        } else {
          await ctx.db.insert("locationFlags", {
            userId: pending.userId,
            lat: roundedLat,
            lng: roundedLng,
            count: 1,
            status: "pending"
          });
        }
      }
    }

    // Cleanup
    await ctx.db.delete(args.pendingId);
  },
});

export const getMemberFlags = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locationFlags")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("status"), "cleared"))
      .collect();
  },
});

export const updateFlagStatus = mutation({
  args: { 
    flagId: v.id("locationFlags"), 
    status: v.union(v.literal("problem"), v.literal("cleared")) 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.flagId, { status: args.status });
  },
});

export const getAllMemberStats = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "team"))
      .collect();

    const now = Date.now();
    const startOfToday = new Date().setHours(0, 0, 0, 0);

    return await Promise.all(
      users.map(async (user) => {
        const team = user.teamId ? await ctx.db.get(user.teamId) : null;
        
        const todayClicks = await ctx.db
          .query("clicks")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.gte(q.field("timestamp"), startOfToday))
          .collect();

        const target = await ctx.db
          .query("targets")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => q.and(
            q.gte(q.field("endDate"), now),
            q.lte(q.field("startDate"), now)
          ))
          .first();

        let targetAchievement = 0;
        let targetPercentage = 0;

        if (target) {
          const targetClicks = await ctx.db
            .query("clicks")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.and(
              q.gte(q.field("timestamp"), target.startDate),
              q.lte(q.field("timestamp"), target.endDate)
            ))
            .collect();
          targetAchievement = targetClicks.length;
          targetPercentage = Math.min(Math.round((targetAchievement / target.target) * 100), 100);
        }

        return {
          _id: user._id,
          name: user.name,
          teamName: team?.name || "No Team",
          total: user.clickCount || 0,
          today: todayClicks.length,
          target: target ? target.target : null,
          targetAchievement,
          targetPercentage,
          lastActive: user.lastActive,
        };
      })
    );
  },
});
