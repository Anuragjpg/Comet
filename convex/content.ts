import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all movies and TV shows with pagination
export const getAllContent = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
    type: v.optional(v.union(v.literal("movie"), v.literal("tv"), v.literal("all"))),
    genre: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal("rating"), v.literal("year"), v.literal("title"))),
  },
  handler: async (ctx, args) => {
    const { type = "all", genre, sortBy = "rating" } = args;
    
    let movies: any[] = [];
    let tvShows: any[] = [];
    
    if (type === "all" || type === "movie") {
      const allMovies = await ctx.db.query("movies").collect();
      if (genre) {
        movies = allMovies.filter(movie => movie.genre.includes(genre));
      } else {
        movies = allMovies;
      }
    }
    
    if (type === "all" || type === "tv") {
      const allTvShows = await ctx.db.query("tvShows").collect();
      if (genre) {
        tvShows = allTvShows.filter(show => show.genre.includes(genre));
      } else {
        tvShows = allTvShows;
      }
    }
    
    const allContent = [...movies, ...tvShows];
    
    // Sort content
    allContent.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "year":
          return b.releaseYear - a.releaseYear;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return b.rating - a.rating;
      }
    });
    
    // Simple pagination
    const startIndex = args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) : 0;
    const endIndex = startIndex + args.paginationOpts.numItems;
    const page = allContent.slice(startIndex, endIndex);
    
    return {
      page,
      isDone: endIndex >= allContent.length,
      continueCursor: endIndex >= allContent.length ? null : endIndex.toString(),
    };
  },
});

// Search content
export const searchContent = query({
  args: {
    query: v.string(),
    type: v.optional(v.union(v.literal("movie"), v.literal("tv"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    const { query, type = "all" } = args;
    
    let results = [];
    
    if (type === "all" || type === "movie") {
      const movieResults = await ctx.db
        .query("movies")
        .withSearchIndex("search_title", (q) => q.search("title", query))
        .take(10);
      results.push(...movieResults);
    }
    
    if (type === "all" || type === "tv") {
      const tvResults = await ctx.db
        .query("tvShows")
        .withSearchIndex("search_title", (q) => q.search("title", query))
        .take(10);
      results.push(...tvResults);
    }
    
    return results.sort((a, b) => b.rating - a.rating);
  },
});

// Get content by ID
export const getContentById = query({
  args: {
    id: v.union(v.id("movies"), v.id("tvShows")),
    type: v.union(v.literal("movie"), v.literal("tv")),
  },
  handler: async (ctx, args) => {
    if (args.type === "movie") {
      return await ctx.db.get(args.id as any);
    } else {
      return await ctx.db.get(args.id as any);
    }
  },
});

// Get top rated content
export const getTopRated = query({
  args: {
    type: v.optional(v.union(v.literal("movie"), v.literal("tv"), v.literal("all"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { type = "all", limit = 10 } = args;
    
    let content = [];
    
    if (type === "all" || type === "movie") {
      const movies = await ctx.db
        .query("movies")
        .withIndex("by_rating")
        .order("desc")
        .take(limit);
      content.push(...movies);
    }
    
    if (type === "all" || type === "tv") {
      const tvShows = await ctx.db
        .query("tvShows")
        .withIndex("by_rating")
        .order("desc")
        .take(limit);
      content.push(...tvShows);
    }
    
    return content
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },
});

// Get available genres
export const getGenres = query({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db.query("movies").collect();
    const tvShows = await ctx.db.query("tvShows").collect();
    
    const genreSet = new Set<string>();
    
    [...movies, ...tvShows].forEach(content => {
      content.genre.forEach(g => genreSet.add(g));
    });
    
    return Array.from(genreSet).sort();
  },
});
