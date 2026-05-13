import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const createTeam = mutation({
  args: { 
    name: v.string(), 
    ward: v.string(), 
    adminId: v.id("users"), // The "authenticated context"
  },
  handler: async (ctx, args) => {
    // 1. Get the logged-in admin from the context
    const currentUser = await ctx.db.get(args.adminId);
    
    if (!currentUser) {
      throw new Error("User context not found");
    }

    // 2. Automatically inherit ulbId from the logged-in Admin account
    const ulbId = currentUser.ulbId;

    if (!ulbId) {
      throw new Error("Admin has no associated ULB");
    }

    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      ward: args.ward,
      clickCount: 0,
      ulbId: ulbId, // Inherited automatically
    });
    return teamId;
  },
});

export const getTeams = query({
  args: { ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .collect();
      
    const now = Date.now();
    const startOfToday = new Date().setHours(0, 0, 0, 0);

    return await Promise.all(
      teams.map(async (team) => {
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        const memberSummary = await Promise.all(
          members.map(async (member) => {
            const todayClicks = await ctx.db
              .query("clicks")
              .withIndex("by_team_member", (q) => q.eq("teamMemberId", member._id))
              .filter((q) => q.gte(q.field("timestamp"), startOfToday))
              .collect();

            const target = await ctx.db
              .query("targets")
              .withIndex("by_team_member", (q) => q.eq("teamMemberId", member._id))
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
  args: { teamId: v.id("teams"), ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team || team.ulbId !== args.ulbId) return null;
    return team;
  },
});

export const incrementClick = mutation({
  args: { 
    teamId: v.optional(v.id("teams")), 
    teamMemberId: v.optional(v.id("teamMembers")),
    userId: v.optional(v.id("users")),
    ulbId: v.id("ulbs"),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    source: v.string()
  },
  handler: async (ctx, args) => {
    // 1. Resolve Team and Admin info if missing
    let teamId = args.teamId;
    let adminId;
    let ulbId = args.ulbId;

    if (args.teamMemberId) {
      const member = await ctx.db.get(args.teamMemberId);
      if (member) {
        teamId = teamId || member.teamId;
        adminId = member.adminId;
        ulbId = ulbId || member.ulbId;
      }
    }

    // 2. Increment Team count
    if (teamId) {
      const team = await ctx.db.get(teamId);
      if (team) {
        await ctx.db.patch(teamId, {
          clickCount: (team.clickCount || 0) + 1,
        });
      }
    }

    // 3. Increment Team Member count
    if (args.teamMemberId) {
      const member = await ctx.db.get(args.teamMemberId);
      if (member) {
        await ctx.db.patch(args.teamMemberId, {
          clickCount: (member.clickCount || 0) + 1,
          todayCount: (member.todayCount || 0) + 1,
        });
      }
    }

    // 4. Record individual click event
    await ctx.db.insert("clicks", {
      teamMemberId: args.teamMemberId,
      teamId: teamId,
      ulbId: ulbId,
      adminId: adminId,
      timestamp: Date.now(),
      lat: args.lat,
      lng: args.lng,
      source: args.source,
    });
  },
});

export const recordSharedClick = mutation({
  args: {
    teamMemberId: v.optional(v.id("teamMembers")),
    userId: v.optional(v.id("users")),
    teamId: v.optional(v.id("teams")),
    ulbId: v.id("ulbs"),
    source: v.string(),
    fingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    // 1. Duplicate prevention check
    const recentClick = await ctx.db
      .query("clicks")
      .withIndex("by_fingerprint", (q) => q.eq("fingerprint", args.fingerprint))
      .filter((q) => q.gt(q.field("timestamp"), now - FIVE_MINUTES))
      .first();

    if (recentClick && (recentClick.teamMemberId === args.teamMemberId || recentClick.userId === args.userId)) {
      return { status: "duplicate", id: recentClick._id };
    }

    // 2. Get context and increment stats
    let teamId = args.teamId;
    let adminId;

    if (args.teamMemberId) {
      const member = await ctx.db.get(args.teamMemberId);
      if (!member) throw new Error("Member not found");
      
      teamId = teamId || member.teamId;
      adminId = member.adminId;

      await ctx.db.patch(args.teamMemberId, {
        clickCount: (member.clickCount || 0) + 1,
        todayCount: (member.todayCount || 0) + 1,
      });
    } else if (args.userId) {
      const user = await ctx.db.get(args.userId);
      if (!user) throw new Error("User not found");
      
      adminId = user.role === "admin" ? user._id : undefined;

      await ctx.db.patch(args.userId, {
        clickCount: (user.clickCount || 0) + 1,
      });
    }

    // 3. Increment Team stats
    if (teamId) {
      const team = await ctx.db.get(teamId);
      if (team) {
        await ctx.db.patch(teamId, {
          clickCount: (team.clickCount || 0) + 1,
        });
      }
    }

    // 4. Record the click
    const clickId = await ctx.db.insert("clicks", {
      teamMemberId: args.teamMemberId,
      userId: args.userId,
      teamId: teamId,
      ulbId: args.ulbId,
      adminId: adminId,
      timestamp: now,
      source: args.source,
      fingerprint: args.fingerprint,
    });

    return { status: "recorded", id: clickId };
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
    // Delete all members of this team first
    const members = await ctx.db
      .query("teamMembers")
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



export const getDetailedLogs = query({
  args: { 
    teamMemberId: v.optional(v.id("teamMembers")),
    ulbId: v.id("ulbs"),
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let clicksQuery = ctx.db
      .query("clicks")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId));

    if (args.teamMemberId) {
      clicksQuery = ctx.db
        .query("clicks")
        .withIndex("by_team_member", (q) => q.eq("teamMemberId", args.teamMemberId))
        .filter(q => q.eq(q.field("ulbId"), args.ulbId));
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
        const member = await ctx.db.get(click.teamMemberId);
        const team = click.teamId ? await ctx.db.get(click.teamId) : null;
        return {
          ...click,
          userName: member?.name || "Unknown",
          teamName: team?.name || "Unknown",
          ward: team?.ward || "Unknown",
        };
      })
    );

    return logs;
  },
});

export const getShareLinkAnalytics = query({
  args: { ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    const clicks = await ctx.db
      .query("clicks")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .collect();
      
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
  args: { teamId: v.id("teams"), ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();
    
    const analytics = await Promise.all(
      members.map(async (member) => {
        const clicks = await ctx.db
          .query("clicks")
          .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
          .filter((q) => q.eq(q.field("teamMemberId"), member._id))
          .collect();
        
        const direct = clicks.filter((c) => c.source === "direct").length;
        const shared = clicks.filter((c) => c.source === "shared").length;
        const total = clicks.length;

        return {
          name: member.name,
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
  args: { memberId: v.id("teamMembers"), ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    const clicks = await ctx.db
      .query("clicks")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .filter((q) => q.eq(q.field("teamMemberId"), args.memberId))
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
    teamMemberId: v.id("teamMembers"),
    ulbId: v.id("ulbs"),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    source: v.string(),
    fingerprint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.teamMemberId);
    const adminId = member?.adminId;

    const pendingId = await ctx.db.insert("pendingClicks", {
      teamMemberId: args.teamMemberId,
      teamId: args.teamId,
      ulbId: args.ulbId,
      adminId: adminId,
      lat: args.lat,
      lng: args.lng,
      source: args.source,
      timestamp: Date.now(),
      lastHeartbeat: Date.now(),
      fingerprint: args.fingerprint,
    });

    // Schedule validation after 15 seconds
    await ctx.scheduler.runAfter(15000, api.teams.validatePendingClick, {
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

      const member = await ctx.db.get(pending.teamMemberId);
      if (member) {
        await ctx.db.patch(pending.teamMemberId, {
          clickCount: (member.clickCount || 0) + 1,
          todayCount: (member.todayCount || 0) + 1,
        });
      }

      await ctx.db.insert("clicks", {
        teamMemberId: pending.teamMemberId,
        teamId: pending.teamId,
        ulbId: pending.ulbId,
        adminId: pending.adminId,
        timestamp: pending.timestamp,
        lat: pending.lat,
        lng: pending.lng,
        source: pending.source,
        fingerprint: pending.fingerprint,
      });

      // --- Spam Detection Logic ---
      if (pending.lat && pending.lng) {
        const roundedLat = Math.round(pending.lat * 10000) / 10000;
        const roundedLng = Math.round(pending.lng * 10000) / 10000;

        const existingFlag = await ctx.db
          .query("locationFlags")
          .withIndex("by_location", (q) => 
            q.eq("teamMemberId", pending.teamMemberId).eq("lat", roundedLat).eq("lng", roundedLng)
          )
          .unique();

        if (existingFlag) {
          const newCount = existingFlag.count + 1;
          await ctx.db.patch(existingFlag._id, {
            count: newCount,
            status: newCount > 10 && existingFlag.status !== "problem" ? "pending" : existingFlag.status
          });
        } else {
          await ctx.db.insert("locationFlags", {
            teamMemberId: pending.teamMemberId,
            ulbId: pending.ulbId,
            adminId: pending.adminId,
            lat: roundedLat,
            lng: roundedLng,
            count: 1,
            status: "pending"
          });
        }
      }

      await ctx.db.delete(args.pendingId);
    } else {
      // Expired session - delete pending
      await ctx.db.delete(args.pendingId);
    }
  },
});

export const getMemberFlags = query({
  args: { memberId: v.id("teamMembers"), ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("locationFlags")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .filter((q) => q.eq(q.field("teamMemberId"), args.memberId))
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

export const getGlobalStats = query({
  args: { ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .collect();
    
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .collect();

    const totalClicks = teams.reduce((acc, team) => acc + (team.clickCount || 0), 0);
    const totalMembers = members.length;

    // Calculate trend & Today's feedback
    const now = Date.now();
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;

    const todayClicks = await ctx.db
      .query("clicks")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .filter((q) => q.gte(q.field("timestamp"), startOfToday))
      .collect();

    const previousClicks = await ctx.db
      .query("clicks")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .filter((q) => 
        q.and(
          q.gt(q.field("timestamp"), fortyEightHoursAgo),
          q.lt(q.field("timestamp"), twentyFourHoursAgo)
        )
      )
      .collect();

    const todayCount = todayClicks.length;
    const previousCount = previousClicks.length;
    
    // Trend calculation
    let trend = 0;
    if (previousCount > 0) {
      trend = Math.round(((todayCount - previousCount) / previousCount) * 100);
    } else if (todayCount > 0) {
      trend = 100;
    }

    // Calculate Targets
    const activeTargets = await ctx.db
      .query("targets")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .filter((q) => q.and(
        q.gte(q.field("endDate"), now),
        q.lte(q.field("startDate"), now)
      ))
      .collect();

    let totalTarget = 0;
    let targetAchievement = 0;

    for (const target of activeTargets) {
      totalTarget += target.target;
      if (target.teamMemberId) {
        const clicks = await ctx.db
          .query("clicks")
          .withIndex("by_team_member", (q) => q.eq("teamMemberId", target.teamMemberId))
          .filter((q) => q.and(
            q.gte(q.field("timestamp"), target.startDate),
            q.lte(q.field("timestamp"), target.endDate)
          ))
          .collect();
        targetAchievement += clicks.length;
      }
    }

    return {
      totalTeams: teams.length,
      totalMembers,
      totalClicks,
      todayCount,
      totalTarget,
      targetAchievement,
      trend: trend >= 0 ? `+${trend}%` : `${trend}%`,
    };
  },
});

export const getAllMemberStats = query({
  args: { ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .collect();

    const now = Date.now();
    const startOfToday = new Date().setHours(0, 0, 0, 0);

    return await Promise.all(
      members.map(async (member) => {
        const team = member.teamId ? await ctx.db.get(member.teamId) : null;
        
        const todayClicks = await ctx.db
          .query("clicks")
          .withIndex("by_team_member", (q) => q.eq("teamMemberId", member._id))
          .filter((q) => q.gte(q.field("timestamp"), startOfToday))
          .collect();

        const target = await ctx.db
          .query("targets")
          .withIndex("by_team_member", (q) => q.eq("teamMemberId", member._id))
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
            .withIndex("by_team_member", (q) => q.eq("teamMemberId", member._id))
            .filter((q) => q.and(
              q.gte(q.field("timestamp"), target.startDate),
              q.lte(q.field("timestamp"), target.endDate)
            ))
            .collect();
          targetAchievement = targetClicks.length;
          targetPercentage = Math.min(Math.round((targetAchievement / target.target) * 100), 100);
        }

        return {
          _id: member._id,
          name: member.name,
          teamName: team?.name || "No Team",
          total: member.clickCount || 0,
          today: todayClicks.length,
          target: target ? target.target : null,
          targetAchievement,
          targetPercentage,
          lastActive: member.lastActive,
        };
      })
    );
  },
});
