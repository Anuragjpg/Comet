import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Rate content
export const rateContent = mutation({
  args: {
    contentId: v.union(v.id("movies"), v.id("tvShows")),
    contentType: v.union(v.literal("movie"), v.literal("tv")),
    rating: v.number(),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to rate content");
    }

    // Check if user already rated this content
    const existingRating = await ctx.db
      .query("userRatings")
      .withIndex("by_user_and_content", (q) => 
        q.eq("userId", userId).eq("contentId", args.contentId)
      )
      .unique();

    if (existingRating) {
      // Update existing rating
      await ctx.db.patch(existingRating._id, {
        rating: args.rating,
        review: args.review,
      });
    } else {
      // Create new rating
      await ctx.db.insert("userRatings", {
        userId,
        contentId: args.contentId,
        contentType: args.contentType,
        rating: args.rating,
        review: args.review,
      });
    }
  },
});

// Add to favorites
export const addToFavorites = mutation({
  args: {
    contentId: v.union(v.id("movies"), v.id("tvShows")),
    contentType: v.union(v.literal("movie"), v.literal("tv")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to add favorites");
    }

    const existing = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_and_content", (q) => 
        q.eq("userId", userId).eq("contentId", args.contentId)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("userFavorites", {
        userId,
        contentId: args.contentId,
        contentType: args.contentType,
      });
    }
  },
});

// Remove from favorites
export const removeFromFavorites = mutation({
  args: {
    contentId: v.union(v.id("movies"), v.id("tvShows")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const favorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_and_content", (q) => 
        q.eq("userId", userId).eq("contentId", args.contentId)
      )
      .unique();

    if (favorite) {
      await ctx.db.delete(favorite._id);
    }
  },
});

// Add to watchlist
export const addToWatchlist = mutation({
  args: {
    contentId: v.union(v.id("movies"), v.id("tvShows")),
    contentType: v.union(v.literal("movie"), v.literal("tv")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to add to watchlist");
    }

    const existing = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_content", (q) => 
        q.eq("userId", userId).eq("contentId", args.contentId)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("watchlist", {
        userId,
        contentId: args.contentId,
        contentType: args.contentType,
      });
    }
  },
});

// Remove from watchlist
export const removeFromWatchlist = mutation({
  args: {
    contentId: v.union(v.id("movies"), v.id("tvShows")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const item = await ctx.db
      .query("watchlist")
      .withIndex("by_user_and_content", (q) => 
        q.eq("userId", userId).eq("contentId", args.contentId)
      )
      .unique();

    if (item) {
      await ctx.db.delete(item._id);
    }
  },
});

// Get user's favorites
export const getUserFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const favorites = await ctx.db
      .query("userFavorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const content = [];
    for (const fav of favorites) {
      let item;
      if (fav.contentType === "movie") {
        item = await ctx.db.get(fav.contentId as any);
      } else {
        item = await ctx.db.get(fav.contentId as any);
      }
      if (item) {
        content.push({ ...item, isFavorite: true });
      }
    }

    return content;
  },
});

// Get user's watchlist
export const getUserWatchlist = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const watchlist = await ctx.db
      .query("watchlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const content = [];
    for (const item of watchlist) {
      let contentItem;
      if (item.contentType === "movie") {
        contentItem = await ctx.db.get(item.contentId as any);
      } else {
        contentItem = await ctx.db.get(item.contentId as any);
      }
      if (contentItem) {
        content.push({ ...contentItem, inWatchlist: true });
      }
    }

    return content;
  },
});

// Get user's ratings
export const getUserRatings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const ratings = await ctx.db
      .query("userRatings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ratedContent = [];
    for (const rating of ratings) {
      let content;
      if (rating.contentType === "movie") {
        content = await ctx.db.get(rating.contentId as any);
      } else {
        content = await ctx.db.get(rating.contentId as any);
      }
      if (content) {
        ratedContent.push({
          ...content,
          userRating: rating.rating,
          userReview: rating.review,
        });
      }
    }

    return ratedContent;
  },
});

// Check if content is favorited/in watchlist
export const getUserContentStatus = query({
  args: {
    contentId: v.union(v.id("movies"), v.id("tvShows")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { isFavorite: false, inWatchlist: false, userRating: null };
    }

    const [favorite, watchlistItem, rating] = await Promise.all([
      ctx.db
        .query("userFavorites")
        .withIndex("by_user_and_content", (q) => 
          q.eq("userId", userId).eq("contentId", args.contentId)
        )
        .unique(),
      ctx.db
        .query("watchlist")
        .withIndex("by_user_and_content", (q) => 
          q.eq("userId", userId).eq("contentId", args.contentId)
        )
        .unique(),
      ctx.db
        .query("userRatings")
        .withIndex("by_user_and_content", (q) => 
          q.eq("userId", userId).eq("contentId", args.contentId)
        )
        .unique(),
    ]);

    return {
      isFavorite: !!favorite,
      inWatchlist: !!watchlistItem,
      userRating: rating?.rating || null,
    };
  },
});
