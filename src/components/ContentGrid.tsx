import { ContentCard } from "./ContentCard";

interface ContentGridProps {
  content: any[];
  onContentClick: (content: any) => void;
}

export function ContentGrid({ content, onContentClick }: ContentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {content.map((item) => (
        <ContentCard
          key={item._id}
          content={item}
          onClick={() => onContentClick(item)}
        />
      ))}
    </div>
  );
}
