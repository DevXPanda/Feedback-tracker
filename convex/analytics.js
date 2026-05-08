import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAdminDashboardData = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin) throw new Error("Admin not found");

    const ulb = admin.ulbId ? await ctx.db.get(admin.ulbId) : null;

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .collect();

    const startOfToday = new Date().setHours(0, 0, 0, 0);

    // Get clicks for this admin
    const clicks = await ctx.db
      .query("clicks")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .collect();
    
    const todayClicks = clicks.filter(c => c.timestamp >= startOfToday);

    // Get targets
    const targets = await ctx.db
      .query("targets")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .collect();

    // Get flags
    const flags = await ctx.db
      .query("locationFlags")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .collect();

    return {
      admin,
      ulb,
      members,
      stats: {
        totalMembers: members.length,
        totalFeedback: clicks.length,
        todayFeedback: todayClicks.length,
      },
      recentActivity: clicks.slice(-50).reverse(), 
      flags: flags.filter(f => f.status !== "cleared"),
      targets,
    };
  },
});
