import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTeamMember = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    password: v.string(),
    teamId: v.optional(v.id("teams")),
    adminId: v.id("users"), // The Admin who created/manages this member
  },
  handler: async (ctx, args) => {
    // 1. Get the admin to get the ulbId
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Invalid admin context");
    }

    const ulbId = admin.ulbId;
    if (!ulbId) {
      throw new Error("Admin has no associated ULB");
    }

    // 2. Determine teamId if not provided
    const teamId = args.teamId;

    // 3. Check for existing team member by phone
    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();
    if (existing) throw new Error("Team member with this phone number already exists");

    // 4. Insert into teamMembers
    return await ctx.db.insert("teamMembers", {
      name: args.name,
      phone: args.phone,
      password: args.password,
      teamId: teamId,
      ulbId: ulbId,
      adminId: args.adminId,
      clickCount: 0,
      todayCount: 0,
      status: "active",
      lastActive: Date.now(),
    });
  },
});

export const login = query({
  args: { identifier: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_phone", (q) => q.eq("phone", args.identifier))
      .unique();
    
    if (!member || member.password !== args.password) {
      return null;
    }
    
    return { ...member, role: "team" }; // Inject role for frontend compatibility
  },
});

export const getMembersByTeam = query({
  args: { teamId: v.id("teams"), ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("ulbId"), args.ulbId))
      .collect();
  },
});

export const getMemberStats = query({
  args: { memberId: v.id("teamMembers"), ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (!member || member.ulbId !== args.ulbId) return null;

    const startOfToday = new Date().setHours(0, 0, 0, 0);

    const todayClicks = await ctx.db
      .query("clicks")
      .withIndex("by_team_member", (q) => q.eq("teamMemberId", args.memberId))
      .filter((q) => q.gte(q.field("timestamp"), startOfToday))
      .collect();

    return {
      totalClicks: member.clickCount || 0,
      todayClicks: todayClicks.length,
      name: member.name,
    };
  },
});

export const getMemberLogs = query({
  args: { memberId: v.id("teamMembers"), ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("clicks")
      .withIndex("by_team_member", (q) => q.eq("teamMemberId", args.memberId))
      .filter((q) => q.eq(q.field("ulbId"), args.ulbId))
      .order("desc")
      .take(50);
    
    return logs;
  },
});

export const updateHeartbeat = mutation({
  args: { memberId: v.id("teamMembers") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    if (member) {
      await ctx.db.patch(args.memberId, {
        lastActive: Date.now(),
      });
    }
  },
});

export const getById = query({
  args: { memberId: v.id("teamMembers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.memberId);
  },
});

export const listMembersByAdmin = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teamMembers")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .collect();
  },
});
