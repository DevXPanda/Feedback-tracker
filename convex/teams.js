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
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");
    await ctx.db.patch(args.teamId, {
      clickCount: team.clickCount + 1,
    });
  },
});
