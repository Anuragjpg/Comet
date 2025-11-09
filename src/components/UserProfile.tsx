import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function UserProfile() {
  const user = useQuery(api.auth.loggedInUser);
  const userRatings = useQuery(api.userInteractions.getUserRatings);
  const favorites = useQuery(api.userInteractions.getUserFavorites);
  const watchlist = useQuery(api.userInteractions.getUserWatchlist);

  if (!user) {
    return <div>Loading...</div>;
  }

  const stats = {
    ratingsCount: userRatings?.length || 0,
    favoritesCount: favorites?.length || 0,
    watchlistCount: watchlist?.length || 0,
    averageRating: userRatings?.length 
      ? (userRatings.reduce((sum, r) => sum + r.userRating, 0) / userRatings.length).toFixed(1)
      : "0",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            {user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user.name || "User"}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.ratingsCount}</div>
            <div className="text-sm text-gray-600">Ratings</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.favoritesCount}</div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.watchlistCount}</div>
            <div className="text-sm text-gray-600">Watchlist</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Recent Ratings */}
      {userRatings && userRatings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Recent Ratings</h3>
          <div className="space-y-4">
            {userRatings.slice(0, 5).map((rating: any) => (
              <div key={rating._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{rating.title}</h4>
                  <p className="text-sm text-gray-600">{rating.releaseYear}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="font-medium">{rating.userRating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
