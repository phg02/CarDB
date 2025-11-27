import { MessageSquare, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewsCard = ({
  id,
  title,
  description,
  image,
  date,
  author,
  tags,
  comments = 0,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/news/${id}`);
  };

  return (
    <article
      onClick={handleClick}
      className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-primary text-primary-foreground">
            {date}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="text-muted-foreground line-clamp-2">{description}</p>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-border text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold">
              {author.charAt(0)}
            </div>
            <span className="text-sm font-medium text-primary">{author}</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs">{comments}</span>
            </button>
           
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
