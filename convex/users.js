import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    password: v.string(),
    role: v.literal("admin"),
    ulbId: v.id("ulbs"),
  },
  handler: async (ctx, args) => {
    // Check for duplicate email
    if (args.email) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
      if (existing) throw new Error("User with this email already exists");
    }

    // Check for duplicate phone
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
      role: args.role,
      ulbId: args.ulbId,
    });
  },
});

export const setupSuperAdmin = mutation({
  handler: async (ctx) => {
    const phone = "9811066609";
    const password = "1";
    
    const existing = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .unique();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        password: password,
        role: "super_admin",
        name: "Global Super Admin"
      });
      return "Super Admin credentials updated";
    }

    await ctx.db.insert("users", {
      name: "Global Super Admin",
      phone: phone,
      password: password,
      role: "super_admin",
    });

    return "Super Admin created";
  },
});

export const login = query({
  args: { identifier: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // 1. Try users table (Admins/Super Admins)
    let user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.identifier))
      .unique();
    
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.identifier))
        .unique();
    }
    
    if (user && user.password === args.password) {
      return user;
    }

    // 2. Try teamMembers table
    const member = await ctx.db
      .query("teamMembers")
      .withIndex("by_phone", (q) => q.eq("phone", args.identifier))
      .unique();
    
    if (member && member.password === args.password) {
      return { ...member, role: "team" }; // Inject role for frontend compatibility
    }
    
    return null;
  },
});

export const getUsers = query({
  args: { ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .collect();
  },
});

export const getUserById = query({
  args: { userId: v.id("users"), ulbId: v.optional(v.id("ulbs")) },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    if (user.role !== "super_admin" && args.ulbId && user.ulbId !== args.ulbId) {
      return null;
    }
    return user;
  },
});

export const createAdmin = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    password: v.string(),
    ulbId: v.id("ulbs"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();
    if (existing) throw new Error("User with this phone number already exists");

    return await ctx.db.insert("users", {
      name: args.name,
      phone: args.phone,
      password: args.password,
      role: "admin",
      ulbId: args.ulbId,
    });
  },
});

export const listAdminsByUlb = query({
  args: { ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_ulb", (q) => q.eq("ulbId", args.ulbId))
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
  },
});

// Migration Mutation
export const migrateTeamMembers = mutation({
  handler: async (ctx) => {
    // This is a one-time migration
    const oldMembers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "team"))
      .collect();

    let migratedCount = 0;
    for (const member of oldMembers) {
      // Check if already migrated (by phone)
      const existing = await ctx.db
        .query("teamMembers")
        .withIndex("by_phone", (q) => q.eq("phone", member.phone))
        .unique();
      
      if (!existing && member.teamId && member.ulbId) {
        await ctx.db.insert("teamMembers", {
          name: member.name,
          phone: member.phone || "",
          password: member.password,
          teamId: member.teamId,
          ulbId: member.ulbId,
          adminId: member.createdBy || (await getFirstAdminId(ctx, member.ulbId)), // Fallback
          clickCount: member.clickCount || 0,
          todayCount: 0,
          status: "active",
          lastActive: member.lastActive || Date.now(),
        });
        
        // Delete from users table after migration
        await ctx.db.delete(member._id);
        migratedCount++;
      }
    }
    return `Migrated ${migratedCount} members`;
  },
});

async function getFirstAdminId(ctx, ulbId) {
  const admin = await ctx.db
    .query("users")
    .withIndex("by_ulb", (q) => q.eq("ulbId", ulbId))
    .filter((q) => q.eq(q.field("role"), "admin"))
    .first();
  return admin ? admin._id : undefined;
}

// End of users logic
