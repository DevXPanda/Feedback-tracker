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
