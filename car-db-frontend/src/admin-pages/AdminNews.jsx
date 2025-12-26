import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import SearchBar from "../components/news/SearchBar";
import NewsCard from "../components/news/NewsCard";
import { useAuth } from "../context/AuthContext";

const AdminNews = () => {
  const { auth } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);

      if (!auth?.accessToken) {
        toast.error("Unauthorized: Please login as admin");
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/news/admin/all", {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        withCredentials: true,
      });

      if (response.data.success) {
        const newsWithComments = await Promise.all(
          response.data.data.news.map(async (article) => {
            try {
              // Fetch comment count for each article
              const commentsResponse = await axios.get(
                `/api/comments/news/${article._id}`,
                { withCredentials: true }
              );

              const commentCount =
                commentsResponse.data.data?.pagination?.totalComments ||
                commentsResponse.data.data?.comments?.length ||
                0;

              return {
                id: article._id,
                title: article.title,
                description: article.content.substring(0, 200) + "...",
                image:
                  article.thumbnail ||
                  article.images?.[0] ||
                  "https://via.placeholder.com/800x600",
                date: new Date(article.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                }),
                author: article.author?.name || "Unknown",
                tags: article.tags || [],
                comments: commentCount,
                isDeleted: article.isDeleted,
              };
            } catch (err) {
              console.error(
                `Error fetching comments for article ${article._id}:`,
                err.message
              );
              return {
                id: article._id,
                title: article.title,
                description: article.content.substring(0, 200) + "...",
                image:
                  article.thumbnail ||
                  article.images?.[0] ||
                  "https://via.placeholder.com/800x600",
                date: new Date(article.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                }),
                author: article.author?.name || "Unknown",
                tags: article.tags || [],
                comments: 0,
                isDeleted: article.isDeleted,
              };
            }
          })
        );
        setNewsArticles(newsWithComments);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      if (error.response?.status === 401) {
        toast.error("Unauthorized: Admin access required");
      } else if (error.response?.status === 403) {
        toast.error("Forbidden: You don't have admin privileges");
      } else {
        toast.error("Failed to load news articles");
      }
    } finally {
      setLoading(false);
    }
  }, [auth?.accessToken]);

  useEffect(() => {
    if (auth?.accessToken) {
      fetchNews();
    }
  }, [fetchNews, auth?.accessToken]);

  const filteredNews = newsArticles.filter((article) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(searchLower) ||
      article.description.toLowerCase().includes(searchLower) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      article.author.toLowerCase().includes(searchLower)
    );
  });

  const sortedNews = [...filteredNews].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.date) - new Date(a.date);
      case "oldest":
        return new Date(a.date) - new Date(b.date);
      case "most-comments":
        return b.comments - a.comments;
      case "title-az":
        return a.title.localeCompare(b.title);
      case "title-za":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl py-8 space-y-8 px-4">
          <div className="space-y-6 pl-4 md:pl-8 lg:pl-12">
            <div className="">
              <div className="container mx-auto px-4">
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <Link to="/" className="hover:text-white transition-colors">
                    Homepage
                  </Link>
                  <span>/</span>
                  <span className="text-white">News</span>
                </nav>
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">News</h1>
                    <p className="text-gray-400">Latest updates and articles</p>
                  </div>
                  <button className="bg-blue-700 py-2 px-5 rounded-[3px] hover:bg-blue-900 transition-colors">
                    <Link to="/post-news">Post New Article</Link>
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search"
              />
            </div>

            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground">
                Latest News
              </h2>
              <div className="relative">
                <label htmlFor="sort" className="sr-only">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-comments">Most Comments</option>
                  <option value="title-az">Title (A-Z)</option>
                  <option value="title-za">Title (Z-A)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                  <svg
                    className="h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Loading articles...
                </p>
              </div>
            ) : sortedNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {sortedNews.map((article) => (
                  <NewsCard key={article.id} {...article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {searchQuery
                    ? `No articles found matching "${searchQuery}"`
                    : "No articles found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminNews;
