import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAdmin = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "nktecipl@gmail.com"))
      .unique();
    
    if (existing) {
      return "Admin already exists";
    }

    await ctx.db.insert("users", {
      name: "Super Admin",
      email: "nktecipl@gmail.com",
      password: "123456",
      clickCount: 0,
      role: "admin",
    });

    return "Admin seeded successfully";
  },
});
