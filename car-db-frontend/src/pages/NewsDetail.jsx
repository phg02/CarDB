import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MessageSquare,
  Phone,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [articleComments, setArticleComments] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const COMMENTS_PER_PAGE = 3;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/news/${id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const newsData = response.data.data.news;
        setArticle({
          id: newsData._id,
          title: newsData.title,
          content: newsData.content,
          mainImage:
            newsData.thumbnail ||
            newsData.images?.[0] ||
            "https://via.placeholder.com/800x600",
          images: newsData.images || [],
          date: new Date(newsData.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
          }),
          author: {
            name: newsData.author?.name || "Unknown",
            email: newsData.author?.email || "",
            phone: newsData.author?.phone || "",
            avatar:
              newsData.author?.profileImage ||
              `https://ui-avatars.com/api/?name=${
                newsData.author?.name || "U"
              }`,
          },
          tags: newsData.tags || [],
        });

        // Fetch related news
        const allNewsResponse = await axios.get("/api/news", {
          withCredentials: true,
        });
        if (allNewsResponse.data.success) {
          const related = allNewsResponse.data.data.news
            .filter((n) => n._id !== id)
            .slice(0, 2)
            .map((n) => ({
              id: n._id,
              title: n.title,
              description: n.content.substring(0, 150) + "...",
              image:
                n.thumbnail ||
                n.images?.[0] ||
                "https://via.placeholder.com/400x300",
              date: new Date(n.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }),
              tags: n.tags || [],
              author: { name: n.author?.name || "Unknown", avatar: "" },
              comments: 0,
              imageCount: 1 + (n.images?.length || 0),
            }));
          setRelatedNews(related);
        }
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`/api/comments/news/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        const mappedComments = response.data.data.comments.map((c) => ({
          id: c._id,
          userId: c.user?._id,
          author: c.user?.name || "Anonymous",
          email: c.user?.email,
          avatar:
            c.user?.profileImage ||
            `https://ui-avatars.com/api/?name=${c.user?.name || "A"}`,
          date: new Date(c.createdAt).toLocaleDateString(),
          text: c.content,
          isCurrentUser: auth?.email === c.user?.email,
        }));
        setArticleComments(mappedComments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [id, auth?.email]);

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [fetchArticle, fetchComments]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleRelatedNewsClick = (newsId) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/news/${newsId}`);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim()) {
      try {
        const token = auth?.accessToken;
        const response = await axios.post(
          `/api/comments/create/${id}`,
          { content: comment },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          const newComment = {
            id: response.data.data.comment._id,
            author: response.data.data.comment.user?.name || "You",
            avatar:
              response.data.data.comment.user?.profileImage ||
              `https://ui-avatars.com/api/?name=Y`,
            date: new Date(
              response.data.data.comment.createdAt
            ).toLocaleDateString(),
            text: response.data.data.comment.content,
            isCurrentUser: true,
          };
          setArticleComments([newComment, ...articleComments]);
          setComment("");
          toast.success("Comment posted successfully");
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        toast.error("Failed to post comment");
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    const comment = articleComments.find((c) => c.id === commentId);

    const message =
      auth?.role === "admin"
        ? "Are you sure you want to delete this comment? (Admin action)"
        : "Are you sure you want to delete this comment?";

    if (window.confirm(message)) {
      try {
        const token = auth?.accessToken;
        if (!token) {
          toast.error("Not authenticated. Please login again.");
          return;
        }

        console.log("🔍 Delete Debug Info:", {
          currentUserEmail: auth?.email,
          commentAuthorEmail: comment?.email,
          userRole: auth?.role,
          isCurrentUser: comment?.isCurrentUser,
          commentId: commentId,
        });

        const response = await axios.delete(`/api/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (response.data.success) {
          setArticleComments(articleComments.filter((c) => c.id !== commentId));
          toast.success(
            auth?.role === "admin"
              ? "Comment removed by admin"
              : "Comment deleted"
          );
        } else {
          toast.error(response.data.message || "Failed to delete comment");
        }
      } catch (error) {
        console.error("❌ Error deleting comment:", error.response?.data);

        // For 403 errors
        if (error.response?.status === 403) {
          const isOwnComment = comment?.isCurrentUser;
          if (isOwnComment) {
            toast.error("You can only delete your own comments");
          } else if (auth?.role === "admin") {
            toast.error(
              "Admin comment deletion requires backend configuration update"
            );
          } else {
            toast.error("You don't have permission to delete this comment");
          }
          return;
        }

        const errorMessage =
          error.response?.data?.message || "Failed to delete comment";
        toast.error(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0A1929] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The article you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/news")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  const displayedComments = showAllComments
    ? articleComments
    : articleComments.slice(0, COMMENTS_PER_PAGE);

  const hasMoreComments = articleComments.length > COMMENTS_PER_PAGE;

  // Use only images array to avoid duplicate thumbnail
  const allImages =
    article?.images && article.images.length > 0
      ? article.images
      : [article?.mainImage || "https://via.placeholder.com/800x600"];

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            className="hover:text-white transition-colors"
          >
            Homepage
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/news")}
            className="hover:text-white transition-colors"
          >
            News
          </button>
          <span>/</span>
          <span className="text-white">{article.title}</span>
        </nav>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          {article.title}
        </h1>

        {/* Image Slider */}
        {allImages.length > 0 && (
          <div className="relative mb-8 rounded-lg overflow-hidden group">
            <img
              src={allImages[currentImageIndex]}
              alt={`${article.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-auto max-h-[600px] object-cover"
            />
            <span className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-sm">
              {article.date}
            </span>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-blue-500 w-6"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Article Content */}
        <div className="text-gray-300 leading-relaxed mb-12 whitespace-pre-wrap">
          {article.content}
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-8">
          {article.tags.map((tag, index) => (
            <span
              key={index}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:border-blue-500 transition-colors cursor-pointer text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Author Info */}
        <div className="bg-[#0D1F2D] border border-gray-700 rounded-lg p-6 mb-12">
          <h3 className="text-white font-semibold text-lg mb-4">Author</h3>
          <div className="flex items-center gap-4">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h4 className="text-white font-semibold text-lg mb-1">
                {article.author.name}
              </h4>
              <div className="flex gap-4 mt-2">
                <a
                  href={`tel:${article.author.phone}`}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-500 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">{article.author.phone}</span>
                </a>
                <a
                  href={`mailto:${article.author.email}`}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-500 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">{article.author.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-12">
          <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            {articleComments.length} Comment
            {articleComments.length !== 1 ? "s" : ""}
          </h3>

          {/* Add Comment Form */}
          <div className="mb-8">
            <h4 className="text-white font-semibold mb-4">Add a Comment</h4>
            {!auth?.accessToken && (
              <div className="mb-4 p-4 bg-[#0D1F2D] border border-blue-500/30 rounded-lg">
                <p className="text-gray-400 text-sm">
                  Please{" "}
                  <button
                    onClick={() =>
                      navigate("/login", {
                        state: { message: "Please sign in to leave a comment" },
                      })
                    }
                    className="text-blue-500 hover:text-blue-400 underline"
                  >
                    sign in
                  </button>{" "}
                  to leave a comment
                </p>
              </div>
            )}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                auth?.accessToken
                  ? "Leave a message here"
                  : "Sign in to leave a comment"
              }
              disabled={!auth?.accessToken}
              className="w-full bg-[#0D1F2D] border border-gray-700 rounded-lg p-4 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-32 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!comment.trim() || !auth?.accessToken}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Comment
            </button>
          </div>

          {/* Comment List */}
          {articleComments.length > 0 ? (
            <>
              <div className="space-y-6 mb-6">
                {displayedComments.map((commentItem) => (
                  <div
                    key={commentItem.id}
                    className="bg-[#0D1F2D] border border-gray-700 rounded-lg p-6 relative group/comment"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={commentItem.avatar}
                        alt={commentItem.author}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold">
                            {commentItem.author}
                          </h4>
                          <span className="text-gray-500 text-sm">
                            {commentItem.date}
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {commentItem.text}
                        </p>
                      </div>
                      {/* Delete button - show for current user's comments OR if user is admin */}
                      {(commentItem.isCurrentUser ||
                        auth?.role === "admin") && (
                        <button
                          onClick={() => handleDeleteComment(commentItem.id)}
                          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover/comment:opacity-100"
                          title={
                            auth?.role === "admin"
                              ? "Delete comment (Admin)"
                              : "Delete your comment"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* See More / See Less Button */}
              {hasMoreComments && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllComments(!showAllComments)}
                    className="text-blue-500 hover:text-blue-400 font-semibold transition-colors flex items-center gap-2 mx-auto"
                  >
                    {showAllComments ? (
                      <>
                        Show Less
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        See More ({articleComments.length - COMMENTS_PER_PAGE}{" "}
                        more)
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 bg-[#0D1F2D] border border-gray-700 rounded-lg">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                No comments yet. Be the first to comment!
              </p>
            </div>
          )}
        </div>

        {/* Related News */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Related News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedNews.map((news) => (
              <div
                key={news.id}
                onClick={() => handleRelatedNewsClick(news.id)}
                className="bg-[#0D1F2D] border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    {news.date}
                  </span>
                  {news.imageCount > 1 && (
                    <span className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      {news.imageCount}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-blue-400 text-lg font-semibold mb-2 group-hover:text-blue-300">
                    {news.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {news.description}
                  </p>
                  <div className="flex gap-2 mb-4">
                    {news.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 border border-gray-600 text-gray-400 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={news.author.avatar}
                        alt={news.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-gray-400 text-sm">
                        {news.author.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{news.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
