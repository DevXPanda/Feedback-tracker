import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  teams: defineTable({
    name: v.string(),
    ward: v.string(),
    clickCount: v.number(),
  }),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("team")),
    teamId: v.optional(v.id("teams")),
  }).index("by_email", ["email"]),
});
