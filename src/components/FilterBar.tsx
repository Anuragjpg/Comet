interface FilterBarProps {
  contentType: "all" | "movie" | "tv";
  onContentTypeChange: (type: "all" | "movie" | "tv") => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  sortBy: "rating" | "year" | "title";
  onSortByChange: (sort: "rating" | "year" | "title") => void;
  genres: string[];
}

export function FilterBar({
  contentType,
  onContentTypeChange,
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortByChange,
  genres,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Content Type Filter */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "movie", label: "Movies" },
          { key: "tv", label: "TV Shows" },
        ].map((type) => (
          <button
            key={type.key}
            onClick={() => onContentTypeChange(type.key as any)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              contentType === type.key
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Genre Filter */}
      <select
        value={selectedGenre}
        onChange={(e) => onGenreChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      >
        <option value="">All Genres</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      {/* Sort Filter */}
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value as any)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      >
        <option value="rating">Sort by Rating</option>
        <option value="year">Sort by Year</option>
        <option value="title">Sort by Title</option>
      </select>
    </div>
  );
}
