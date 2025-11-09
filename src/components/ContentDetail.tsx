import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ContentGrid } from "./ContentGrid";

interface ContentDetailProps {
  content: any;
  onBack: () => void;
}

export function ContentDetail({ content, onBack }: ContentDetailProps) {
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState("");
  
  const userStatus = useQuery(api.userInteractions.getUserContentStatus, {
    contentId: content._id,
  });
  
  const similarContent = useQuery(api.recommendations.getSimilarContent, {
    contentId: content._id,
    contentType: content.type,
    limit: 6,
  });

  const rateContent = useMutation(api.userInteractions.rateContent);
  const addToFavorites = useMutation(api.userInteractions.addToFavorites);
  const removeFromFavorites = useMutation(api.userInteractions.removeFromFavorites);
  const addToWatchlist = useMutation(api.userInteractions.addToWatchlist);
  const removeFromWatchlist = useMutation(api.userInteractions.removeFromWatchlist);

  const isMovie = content.type === "movie";

  const handleRating = async (rating: number) => {
    setUserRating(rating);
    await rateContent({
      contentId: content._id,
      contentType: content.type,
      rating,
      review: review || undefined,
    });
  };

  const handleFavoriteToggle = async () => {
    if (userStatus?.isFavorite) {
      await removeFromFavorites({ contentId: content._id });
    } else {
      await addToFavorites({
        contentId: content._id,
        contentType: content.type,
      });
    }
  };

  const handleWatchlistToggle = async () => {
    if (userStatus?.inWatchlist) {
      await removeFromWatchlist({ contentId: content._id });
    } else {
      await addToWatchlist({
        contentId: content._id,
        contentType: content.type,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        ← Back to Browse
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Poster */}
        <div className="lg:col-span-1">
          <div className="aspect-[2/3] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <div className="text-white text-center p-8">
              <div className="text-6xl mb-4">🎬</div>
              <div className="text-xl font-bold">{content.title}</div>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-lg text-gray-600">{content.releaseYear}</span>
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">⭐</span>
              <span className="text-lg font-medium">{content.rating.toFixed(1)}/10</span>
            </div>
            <span className="text-gray-600">
              {isMovie ? `${content.duration} min` : `${content.seasons} seasons`}
            </span>
            {!isMovie && (
              <span className={`px-3 py-1 rounded-full text-sm ${
                content.status === "ongoing" ? "bg-green-100 text-green-800" :
                content.status === "completed" ? "bg-blue-100 text-blue-800" :
                "bg-red-100 text-red-800"
              }`}>
                {content.status}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {content.genre.map((genre: string) => (
              <span
                key={genre}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{content.description}</p>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">
              {isMovie ? "Director" : "Creator"}
            </h3>
            <p className="text-gray-700">{isMovie ? content.director : content.creator}</p>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Cast</h3>
            <p className="text-gray-700">{content.cast.join(", ")}</p>
          </div>

          {/* User Actions */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Your Actions</h3>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={handleFavoriteToggle}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  userStatus?.isFavorite
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {userStatus?.isFavorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
              </button>
              
              <button
                onClick={handleWatchlistToggle}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  userStatus?.inWatchlist
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {userStatus?.inWatchlist ? "📋 Remove from Watchlist" : "📝 Add to Watchlist"}
              </button>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Rate this {isMovie ? "movie" : "show"}</h4>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`text-2xl transition-colors ${
                      star <= (userStatus?.userRating || userRating)
                        ? "text-yellow-500"
                        : "text-gray-300 hover:text-yellow-400"
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {userStatus?.userRating && (
                <p className="text-sm text-gray-600 mt-1">
                  You rated this {userStatus.userRating}/5 stars
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Content */}
      {similarContent && similarContent.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar {isMovie ? "Movies" : "TV Shows"}</h2>
          <ContentGrid
            content={similarContent}
            onContentClick={(content) => window.location.reload()} // Simple refresh for demo
          />
        </div>
      )}
    </div>
  );
}
