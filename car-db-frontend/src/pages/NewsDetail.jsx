import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Phone,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Mock data - in real app, this would be fetched from API
const allArticles = [
  {
    id: 1,
    title: "The Future of Electric Vehicles",
    breadcrumb: "Homepage / News / The Future of Electric Vehicles",
    mainImage:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    date: "June, 01 2021",
    content: [
      {
        type: "text",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget praesent gravida sed rutrum suspendisse ac. Lectus fermentum in gravida nibh in vel. Accumsan gravida nec ultricies nec eget arcu nisi turpis lorem.",
      },
      {
        type: "text",
        text: "Ullamcorper pellentesque diam eget volutpat. Ut senectus rhoncus elit nist vitae erat. Orci quisque in. Quisque ut viverra interdum id ut in. Consequat, convallis iaculis dictum urna tellus fames arcu, at. Pretium venenatis, pharettra, rhus, sagittis interdum viverra suspendisse morbi cursus.",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      },
      {
        type: "heading",
        text: "Why?",
      },
      {
        type: "list",
        items: [
          "Leo amet, posuere nibh nam nulla vestibulum sagittis mauris.",
          "Elementum lacus, et sed praesent lectus nis diam pulvinar eget.",
          "Vulputate nibh molestie eros dapibus.",
          "Blandit venenatis, commodo magna dictumst ac consequat, etiam sed.",
        ],
      },
      {
        type: "heading",
        text: "How?",
      },
      {
        type: "list",
        items: [
          "Leo amet, posuere nibh nam nulla vestibulum sagittis mauris.",
          "Elementum lacus, et sed praesent lectus nis diam pulvinar eget.",
          "Vulputate nibh molestie eros dapibus.",
          "Blandit venenatis, commodo magna dictumst ac consequat, etiam sed.",
        ],
      },
      {
        type: "heading",
        text: "Finishing",
      },
      {
        type: "text",
        text: "Leo amet, posuere nibh nam nulla vestibulum sagittis mauris. Fermentum lacus, et sed praesent lectus nis diam pulvinar eget. Vulputate nibh molestie eros dapibus. Blandit venenatis, commodo magna dictumst ac consequat, etiam sed. Scelerisque nisi nam et lacus, fringilla amet ut enim. Dui porttitor faucibus mauris habitasse adipiscing pellentesque sem nulla nec. Fermentum, blandit mollis defermd volutpat. Risus agia enim sed a id risus, malesuet it.",
      },
    ],
    tags: ["Dealer", "Electric"],
    author: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=5",
      phone: "240-865-3730",
      email: "john.smith@mail.com",
    },
    comments: [
      {
        id: 1,
        author: "Ryan Gander",
        avatar: "https://i.pravatar.cc/150?img=12",
        date: "1 day ago",
        text: "Quis placerat mi semper amet neque. Lacus ut natoque non pretium tortiquet idipsum vitae. US lorem sem mauris accumsit. Gratia uni ante, lobor sint. Etiam Malesuada vel, tempor ante magna, blandic magna dui. Auctor quisque Maecenas sed porttior pretium sodales gravida Aliquam ac tempor nibh. Aliquam porttitor consequt pulvinar lectus vel aliauam magha. Velit feu platea nsi et. Est morbi gravida pretium.",
      },
    ],
  },
  {
    id: 2,
    title: "Top Sports Cars of 2024 - 2025",
    breadcrumb: "Homepage / News / Top Sports Cars of 2024",
    mainImage:
      "https://tse3.mm.bing.net/th/id/OIP.ShBl0daSHVhATYHqHF5W4QHaEK?pid=Api&P=0&h=180",
    date: "June, 01 2021",
    content: [
      {
        type: "text",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget praesent gravida sed rutrum suspendisse ac. Lectus fermentum in gravida nibh in vel. Accumsan gravida nec ultricies nec eget arcu nisi turpis lorem.",
      },
      {
        type: "heading",
        text: "Performance",
      },
      {
        type: "text",
        text: "Ullamcorper pellentesque diam eget volutpat. Ut senectus rhoncus elit nist vitae erat. Orci quisque in. Quisque ut viverra interdum id ut in.",
      },
    ],
    tags: ["Sports", "Performance"],
    author: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=7",
      phone: "240-865-3731",
      email: "sarah.j@mail.com",
    },
    comments: [],
  },
  {
    id: 3,
    title: "Electric Car Charging Infrastructure",
    breadcrumb: "Homepage / News / Electric Car Charging Infrastructure",
    mainImage:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    date: "May, 28 2021",
    content: [
      {
        type: "text",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget praesent gravida sed rutrum suspendisse ac. Lectus fermentum in gravida nibh in vel. Accumsan gravida nec ultricies nec eget arcu nisi turpis lorem.",
      },
    ],
    tags: ["Electric", "Technology"],
    author: {
      name: "Mike Davis",
      avatar: "https://i.pravatar.cc/150?img=3",
      phone: "240-865-3732",
      email: "mike.d@mail.com",
    },
    comments: [],
  },
  {
    id: 4,
    title: "Autonomous Driving Technology Advances",
    breadcrumb: "Homepage / News / Autonomous Driving Technology Advances",
    mainImage:
      "https://images.unsplash.com/photo-1518655048521-f130df041f66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    date: "May, 25 2021",
    content: [
      {
        type: "text",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget praesent gravida sed rutrum suspendisse ac. Lectus fermentum in gravida nibh in vel. Accumsan gravida nec ultricies nec eget arcu nisi turpis lorem.",
      },
    ],
    tags: ["Technology", "Innovation"],
    author: {
      name: "Emily Chen",
      avatar: "https://i.pravatar.cc/150?img=4",
      phone: "240-865-3733",
      email: "emily.c@mail.com",
    },
    comments: [],
  },
];

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  // Find the article by ID
  const article = allArticles.find((article) => article.id === parseInt(id));

  const [comment, setComment] = useState("");
  const [articleComments, setArticleComments] = useState(
    article?.comments || []
  );
  const [showAllComments, setShowAllComments] = useState(false);
  const COMMENTS_PER_PAGE = 3;

  // Image slider state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Collect all images (mainImage + content images)
  const allImages = article
    ? [
        article.mainImage,
        ...article.content
          .filter((item) => item.type === "image")
          .map((item) => item.url),
      ]
    : [];

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

  // If article not found, show error
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

  // Get related news (other articles excluding current one)
  const relatedNews = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 2)
    .map((news) => ({
      id: news.id,
      title: news.title,
      description: news.content.find((c) => c.type === "text")?.text || "",
      image: news.mainImage,
      date: news.date,
      tags: news.tags,
      author: news.author,
      comments: news.comments.length,
      imageCount: 1 + news.content.filter((c) => c.type === "image").length,
    }));

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        author: "Current User",
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(
          Math.random() * 70
        )}`,
        date: "Just now",
        text: comment.trim(),
        isCurrentUser: true, // Mark as current user's comment
      };

      setArticleComments([newComment, ...articleComments]);
      setComment("");
    }
  };

  const handleDeleteComment = (commentId) => {
    const message =
      auth?.role === "admin"
        ? "Are you sure you want to delete this comment? (Admin action)"
        : "Are you sure you want to delete this comment?";

    if (window.confirm(message)) {
      setArticleComments(articleComments.filter((c) => c.id !== commentId));
    }
  };

  // Determine which comments to display
  const displayedComments = showAllComments
    ? articleComments
    : articleComments.slice(0, COMMENTS_PER_PAGE);

  const hasMoreComments = articleComments.length > COMMENTS_PER_PAGE;

  const renderContent = (item, index) => {
    switch (item.type) {
      case "text":
        return (
          <p key={index} className="text-gray-300 leading-relaxed mb-6">
            {item.text}
          </p>
        );
      case "image":
        // Images are now handled by the slider, skip rendering here
        return null;
      case "heading":
        return (
          <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">
            {item.text}
          </h2>
        );
      case "list":
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6">
            {item.items.map((listItem, i) => (
              <li key={i} className="text-gray-300">
                {listItem}
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

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
        <div className="mb-12">
          {article.content.map((item, index) => renderContent(item, index))}
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
                              : "Delete comment"
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
