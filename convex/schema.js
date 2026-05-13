import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ulbs: defineTable({
    name: v.string(),
    code: v.string(), // e.g. "ndmc", "mcd"
  }).index("by_code", ["code"]),

  teams: defineTable({
    name: v.string(),
    ward: v.string(),
    clickCount: v.number(),
    ulbId: v.optional(v.id("ulbs")),
  }).index("by_ulb", ["ulbId"]),

  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    password: v.string(),
    lastActive: v.optional(v.number()),
    clickCount: v.optional(v.number()), // Legacy
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("team")), // Allow legacy team role
    ulbId: v.optional(v.id("ulbs")), // Optional only for super_admin
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_ulb", ["ulbId"]),

  teamMembers: defineTable({
    name: v.string(),
    phone: v.string(),
    password: v.string(),
    teamId: v.optional(v.id("teams")),
    ulbId: v.id("ulbs"),
    adminId: v.id("users"), // The Admin who created/manages this member
    clickCount: v.number(),
    todayCount: v.number(),
    targetFeedback: v.optional(v.number()),
    lastActive: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("inactive")),
  })
    .index("by_phone", ["phone"])
    .index("by_team", ["teamId"])
    .index("by_ulb", ["ulbId"])
    .index("by_admin", ["adminId"]),

  clicks: defineTable({
    teamMemberId: v.optional(v.id("teamMembers")),
    userId: v.optional(v.id("users")), // Keeping for legacy/migration
    teamId: v.optional(v.id("teams")),
    ulbId: v.optional(v.id("ulbs")),
    adminId: v.optional(v.id("users")), // The Admin who manages the member who generated this click
    timestamp: v.number(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    source: v.optional(v.string()), // "direct" or "shared"
    status: v.optional(v.string()), // e.g. "completed"
    fingerprint: v.optional(v.string()), // For duplicate prevention
  })
    .index("by_team_member", ["teamMemberId", "timestamp"])
    .index("by_user", ["userId", "timestamp"])
    .index("by_team", ["teamId", "timestamp"])
    .index("by_timestamp", ["timestamp"])
    .index("by_ulb", ["ulbId"])
    .index("by_admin", ["adminId"])
    .index("by_fingerprint", ["fingerprint"]),

  targets: defineTable({
    target: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    teamId: v.optional(v.id("teams")),
    teamMemberId: v.optional(v.id("teamMembers")),
    userId: v.optional(v.id("users")), // Legacy
    ulbId: v.optional(v.id("ulbs")),
    adminId: v.optional(v.id("users")),
    label: v.optional(v.string()), // e.g. "Daily Target"
  })
    .index("by_team", ["teamId"])
    .index("by_team_member", ["teamMemberId"])
    .index("by_user", ["userId"])
    .index("by_ulb", ["ulbId"])
    .index("by_admin", ["adminId"])
    .index("by_date_range", ["startDate", "endDate"]),

  pendingClicks: defineTable({
    teamMemberId: v.optional(v.id("teamMembers")),
    userId: v.optional(v.id("users")), // Legacy
    teamId: v.optional(v.id("teams")),
    ulbId: v.optional(v.id("ulbs")),
    adminId: v.optional(v.id("users")),
    timestamp: v.number(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    source: v.string(),
    lastHeartbeat: v.number(),
    fingerprint: v.optional(v.string()),
  }).index("by_ulb", ["ulbId"]).index("by_team_member", ["teamMemberId"]).index("by_admin", ["adminId"]),

  locationFlags: defineTable({
    teamMemberId: v.optional(v.id("teamMembers")),
    userId: v.optional(v.id("users")), // Legacy
    ulbId: v.optional(v.id("ulbs")),
    adminId: v.optional(v.id("users")),
    lat: v.float64(),
    lng: v.float64(),
    count: v.number(),
    status: v.union(v.literal("pending"), v.literal("problem"), v.literal("cleared")),
  })
    .index("by_team_member", ["teamMemberId"])
    .index("by_user", ["userId"])
    .index("by_ulb", ["ulbId"])
    .index("by_admin", ["adminId"])
    .index("by_location", ["teamMemberId", "lat", "lng"]),
});
