import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  movies: defineTable({
    title: v.string(),
    description: v.string(),
    genre: v.array(v.string()),
    releaseYear: v.number(),
    rating: v.number(), // IMDb-style rating out of 10
    posterUrl: v.optional(v.string()),
    type: v.literal("movie"),
    director: v.string(),
    cast: v.array(v.string()),
    duration: v.number(), // in minutes
  })
    .index("by_rating", ["rating"])
    .index("by_year", ["releaseYear"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["type"],
    }),

  tvShows: defineTable({
    title: v.string(),
    description: v.string(),
    genre: v.array(v.string()),
    releaseYear: v.number(),
    rating: v.number(),
    posterUrl: v.optional(v.string()),
    type: v.literal("tv"),
    creator: v.string(),
    cast: v.array(v.string()),
    seasons: v.number(),
    status: v.union(v.literal("ongoing"), v.literal("completed"), v.literal("cancelled")),
  })
    .index("by_rating", ["rating"])
    .index("by_year", ["releaseYear"])
    .index("by_status", ["status"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["type", "status"],
    }),

  userRatings: defineTable({
    userId: v.id("users"),
    contentId: v.union(v.id("movies"), v.id("tvShows")),
    contentType: v.union(v.literal("movie"), v.literal("tv")),
    rating: v.number(), // 1-5 stars
    review: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_content", ["contentId", "contentType"])
    .index("by_user_and_content", ["userId", "contentId"]),

  userFavorites: defineTable({
    userId: v.id("users"),
    contentId: v.union(v.id("movies"), v.id("tvShows")),
    contentType: v.union(v.literal("movie"), v.literal("tv")),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_content", ["userId", "contentId"]),

  watchlist: defineTable({
    userId: v.id("users"),
    contentId: v.union(v.id("movies"), v.id("tvShows")),
    contentType: v.union(v.literal("movie"), v.literal("tv")),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_content", ["userId", "contentId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
