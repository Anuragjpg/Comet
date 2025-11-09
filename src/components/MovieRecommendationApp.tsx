import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ContentGrid } from "./ContentGrid";
import { ContentDetail } from "./ContentDetail";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import { UserProfile } from "./UserProfile";

export function MovieRecommendationApp() {
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [contentType, setContentType] = useState<"all" | "movie" | "tv">("all");
  const [sortBy, setSortBy] = useState<"rating" | "year" | "title">("rating");
  const [activeTab, setActiveTab] = useState<"browse" | "recommendations" | "favorites" | "watchlist" | "profile">("browse");

  const seedDatabase = useMutation(api.seedData.seedDatabase);

  // Queries based on active tab and search
  const contentData = useQuery(
    api.content.getAllContent,
    activeTab === "browse" && !searchQuery
      ? {
          paginationOpts: { numItems: 20, cursor: null },
          type: contentType,
          genre: selectedGenre || undefined,
          sortBy,
        }
      : "skip"
  );

  const searchResults = useQuery(
    api.content.searchContent,
    searchQuery
      ? { query: searchQuery, type: contentType }
      : "skip"
  );

  const recommendations = useQuery(
    api.recommendations.getRecommendations,
    activeTab === "recommendations" ? { limit: 20 } : "skip"
  );

  const favorites = useQuery(
    api.userInteractions.getUserFavorites,
    activeTab === "favorites" ? {} : "skip"
  );

  const watchlist = useQuery(
    api.userInteractions.getUserWatchlist,
    activeTab === "watchlist" ? {} : "skip"
  );

  const genres = useQuery(api.content.getGenres);

  // Determine which content to display
  let displayContent = [];
  if (searchQuery && searchResults) {
    displayContent = searchResults;
  } else if (activeTab === "browse" && contentData) {
    displayContent = contentData.page;
  } else if (activeTab === "recommendations" && recommendations) {
    displayContent = recommendations;
  } else if (activeTab === "favorites" && favorites) {
    displayContent = favorites;
  } else if (activeTab === "watchlist" && watchlist) {
    displayContent = watchlist;
  }

  const handleSeedDatabase = async () => {
    try {
      await seedDatabase();
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  };

  if (selectedContent) {
    return (
      <ContentDetail
        content={selectedContent}
        onBack={() => setSelectedContent(null)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        {[
          { key: "browse", label: "Browse" },
          { key: "recommendations", label: "For You" },
          { key: "favorites", label: "Favorites" },
          { key: "watchlist", label: "Watchlist" },
          { key: "profile", label: "Profile" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" ? (
        <UserProfile />
      ) : (
        <>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search movies and TV shows..."
            />
            
            {activeTab === "browse" && (
              <FilterBar
                contentType={contentType}
                onContentTypeChange={setContentType}
                selectedGenre={selectedGenre}
                onGenreChange={setSelectedGenre}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                genres={genres || []}
              />
            )}
          </div>

          {/* Content Grid */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {activeTab === "browse" && searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : activeTab === "browse"
                  ? "Browse Content"
                  : activeTab === "recommendations"
                  ? "Recommended for You"
                  : activeTab === "favorites"
                  ? "Your Favorites"
                  : "Your Watchlist"}
              </h2>
              
              {activeTab === "browse" && !searchQuery && displayContent.length === 0 && (
                <button
                  onClick={handleSeedDatabase}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load Sample Data
                </button>
              )}
            </div>

            <ContentGrid
              content={displayContent}
              onContentClick={setSelectedContent}
            />

            {displayContent.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {activeTab === "browse" && searchQuery
                    ? "No results found for your search."
                    : activeTab === "recommendations"
                    ? "Start rating some content to get personalized recommendations!"
                    : activeTab === "favorites"
                    ? "You haven't added any favorites yet."
                    : activeTab === "watchlist"
                    ? "Your watchlist is empty."
                    : "No content available. Try loading some sample data!"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
