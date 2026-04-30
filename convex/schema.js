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
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    password: v.string(),
    clickCount: v.optional(v.number()),
    lastActive: v.optional(v.number()),
    role: v.union(v.literal("admin"), v.literal("team")),
    teamId: v.optional(v.id("teams")),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_team", ["teamId"]),
  clicks: defineTable({
    userId: v.id("users"),
    teamId: v.id("teams"),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_team", ["teamId"])
    .index("by_timestamp", ["timestamp"]),
  targets: defineTable({
    target: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    teamId: v.optional(v.id("teams")),
    userId: v.optional(v.id("users")),
    label: v.optional(v.string()), // e.g. "Daily Target"
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_date_range", ["startDate", "endDate"]),
});
