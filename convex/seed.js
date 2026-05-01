import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedAdmin = mutation({
  handler: async (ctx) => {
    const phone = "7836055511";
    const password = "1";
    
    const existing = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .unique();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        password: password,
        role: "admin",
        name: "Super Admin"
      });
      return "Admin credentials updated";
    }

    await ctx.db.insert("users", {
      name: "Super Admin",
      phone: phone,
      password: password,
      clickCount: 0,
      role: "admin",
    });

    return "Admin seeded successfully";
  },
});
