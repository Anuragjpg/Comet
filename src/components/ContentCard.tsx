interface ContentCardProps {
  content: any;
  onClick: () => void;
}

export function ContentCard({ content, onClick }: ContentCardProps) {
  const isMovie = content.type === "movie";
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="aspect-[2/3] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center p-4">
          <div className="text-2xl font-bold mb-2">🎬</div>
          <div className="text-sm font-medium">{content.title}</div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{content.title}</h3>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            {content.releaseYear}
          </span>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">⭐</span>
            <span className="text-sm font-medium">{content.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {content.genre.slice(0, 2).map((genre: string) => (
            <span
              key={genre}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
        
        <div className="text-xs text-gray-500">
          {isMovie ? `${content.duration} min` : `${content.seasons} seasons`}
        </div>
      </div>
    </div>
  );
}
