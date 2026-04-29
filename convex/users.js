import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("team")),
    teamId: v.optional(v.id("teams")),
  },
  handler: async (ctx, args) => {
    if (args.email) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
      if (existing) throw new Error("User with this email already exists");
    }
    
    if (args.phone) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .unique();
      if (existing) throw new Error("User with this phone number already exists");
    }
    
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      password: args.password,
      clickCount: 0,
      role: args.role,
      teamId: args.teamId,
    });
  },
});

export const login = query({
  args: { identifier: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // Try email first
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.identifier))
      .unique();
    
    // Then try phone
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.identifier))
        .unique();
    }
    
    if (!user || user.password !== args.password) {
      return null;
    }
    
    return user;
  },
});

export const getMembersByTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.and(
        q.eq(q.field("teamId"), args.teamId),
        q.eq(q.field("role"), "team")
      ))
      .collect();
  },
});

export const updateHeartbeat = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastActive: Date.now(),
    });
  },
});

export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getMemberStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const startOfToday = new Date().setHours(0, 0, 0, 0);

    const todayClicks = await ctx.db
      .query("clicks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), startOfToday))
      .collect();

    return {
      totalClicks: user.clickCount || 0,
      todayClicks: todayClicks.length,
      name: user.name,
    };
  },
});
