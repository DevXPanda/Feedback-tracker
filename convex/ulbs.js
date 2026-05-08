import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { name: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    // Check if code already exists
    const existing = await ctx.db
      .query("ulbs")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (existing) throw new Error("ULB code already exists");

    return await ctx.db.insert("ulbs", {
      name: args.name,
      code: args.code,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("ulbs").collect();
  },
});

export const getById = query({
  args: { ulbId: v.id("ulbs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ulbId);
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ulbs")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
  },
});
export const listWithStats = query({
  handler: async (ctx) => {
    const ulbs = await ctx.db.query("ulbs").collect();
    
    return await Promise.all(ulbs.map(async (ulb) => {
      const admins = await ctx.db
        .query("users")
        .withIndex("by_ulb", (q) => q.eq("ulbId", ulb._id))
        .filter((q) => q.eq(q.field("role"), "admin"))
        .collect();

      const members = await ctx.db
        .query("teamMembers")
        .withIndex("by_ulb", (q) => q.eq("ulbId", ulb._id))
        .collect();

      const clicks = await ctx.db
        .query("clicks")
        .withIndex("by_ulb", (q) => q.eq("ulbId", ulb._id))
        .collect();

      return {
        ...ulb,
        adminCount: admins.length,
        memberCount: members.length,
        feedbackCount: clicks.length,
      };
    }));
  },
});
