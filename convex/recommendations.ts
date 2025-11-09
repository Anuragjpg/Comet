import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get personalized recommendations
export const getRecommendations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const limit = args.limit || 10;
    
    if (!userId) {
      // Return top-rated content for non-logged-in users
      const movies = await ctx.db
        .query("movies")
        .withIndex("by_rating")
        .order("desc")
        .take(5);
      const tvShows = await ctx.db
        .query("tvShows")
        .withIndex("by_rating")
        .order("desc")
        .take(5);
      
      return [...movies, ...tvShows]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    }

    // Get user's ratings and favorites to understand preferences
    const [userRatings, userFavorites] = await Promise.all([
      ctx.db
        .query("userRatings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("userFavorites")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    // Extract preferred genres from highly rated content
    const preferredGenres = new Set<string>();
    const highlyRatedContent = userRatings.filter(r => r.rating >= 4);
    
    for (const rating of highlyRatedContent) {
      let content: any;
      if (rating.contentType === "movie") {
        content = await ctx.db.get(rating.contentId as any);
      } else {
        content = await ctx.db.get(rating.contentId as any);
      }
      if (content && content.genre) {
        content.genre.forEach((g: string) => preferredGenres.add(g));
      }
    }

    // Get content user hasn't rated yet
    const ratedContentIds = new Set(userRatings.map(r => r.contentId));
    const favoriteContentIds = new Set(userFavorites.map(f => f.contentId));
    
    const [allMovies, allTvShows] = await Promise.all([
      ctx.db.query("movies").collect(),
      ctx.db.query("tvShows").collect(),
    ]);
    
    const allContent = [...allMovies, ...allTvShows];
    
    // Filter out already rated/favorited content
    const unratedContent = allContent.filter(
      content => !ratedContentIds.has(content._id) && !favoriteContentIds.has(content._id)
    );

    // Score content based on genre preferences and rating
    const scoredContent = unratedContent.map(content => {
      let score = content.rating; // Base score is the content's rating
      
      // Boost score for preferred genres
      const genreBonus = content.genre.filter(g => preferredGenres.has(g)).length * 0.5;
      score += genreBonus;
      
      return { ...content, recommendationScore: score };
    });

    // Sort by recommendation score and return top results
    return scoredContent
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  },
});

// Get similar content based on a specific item
export const getSimilarContent = query({
  args: {
    contentId: v.union(v.id("movies"), v.id("tvShows")),
    contentType: v.union(v.literal("movie"), v.literal("tv")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 6;
    
    // Get the reference content
    let referenceContent: any;
    if (args.contentType === "movie") {
      referenceContent = await ctx.db.get(args.contentId as any);
    } else {
      referenceContent = await ctx.db.get(args.contentId as any);
    }
    
    if (!referenceContent) {
      return [];
    }

    // Get all content of the same type
    let allContent: any[];
    if (args.contentType === "movie") {
      allContent = await ctx.db.query("movies").collect();
    } else {
      allContent = await ctx.db.query("tvShows").collect();
    }
    
    // Filter out the reference content itself
    const otherContent = allContent.filter(content => content._id !== args.contentId);
    
    // Score similarity based on shared genres and rating proximity
    const scoredContent = otherContent.map((content: any) => {
      const sharedGenres = content.genre?.filter((g: string) => referenceContent.genre?.includes(g)).length || 0;
      const ratingDifference = Math.abs((content.rating || 0) - (referenceContent.rating || 0));
      
      // Higher score for more shared genres and similar ratings
      const similarityScore = (sharedGenres * 2) - (ratingDifference * 0.5);
      
      return { ...content, similarityScore };
    });

    // Sort by similarity score and return top results
    return scoredContent
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  },
});
