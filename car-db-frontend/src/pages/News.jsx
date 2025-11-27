import { useState } from "react";
import SearchBar from "../components/news/SearchBar";
import NewsCard from "../components/news/NewsCard";

const newsArticles = [
  {
    id: 1,
    title: "The Future of Electric Vehicles",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget praesent gravida sed rutrum suspendisse ac. Lectus fermentum in gravida nibh in vel. Accumsan gravida nec ultricies nec eget arcu nisi turpis lorem.",
    image: `https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWNvJTIwY2FyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60`,
    date: "June, 01 2021",
    author: "John Smith",
    tags: ["Dealer", "Electric"],
    comments: 12,
  },
  {
    id: 2,
    title: "Top Sports Cars of 2024 - 2025",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget praesent gravida sed rutrum suspendisse ac. Lectus fermentum in gravida nibh in vel. Accumsan gravida nec ultricies nec eget arcu nisi turpis lorem.",
    image: `https://tse3.mm.bing.net/th/id/OIP.ShBl0daSHVhATYHqHF5W4QHaEK?pid=Api&P=0&h=180`,
    date: "June, 01 2021",
    author: "Sarah Johnson",
    tags: ["Sports", "Performance"],
    comments: 8,
  },
  {
    id: 3,
    title: "Electric Car Charging Infrastructure",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget praesent gravida sed rutrum suspendisse ac. Lectus fermentum in gravida nibh in vel. Accumsan gravida nec ultricies nec eget arcu nisi turpis lorem.",
    image: `https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZWNvJTIwY2FyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60`,
    date: "May, 28 2021",
    author: "Mike Davis",
    tags: ["Electric", "Technology"],
    comments: 15,
  },
  {
    id: 4,
    title: "Autonomous Driving Technology Advances",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget praesent gravida sed rutrum suspendisse ac. Lectus fermentum in gravida nibh in vel. Accumsan gravida nec ultricies nec eget arcu nisi turpis lorem.",
    image: `https://images.unsplash.com/photo-1518655048521-f130df041f66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGF1dG9ub21vdXMlMjBjYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60`,
    date: "May, 25 2021",
    author: "Emily Chen",
    tags: ["Technology", "Innovation"],
    comments: 20,
  },
];

const News = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

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
                  <div className="hover:text-white transition-colors">
                    Homepage
                  </div>
                  <span>/</span>
                  <span className="text-white">News</span>
                </nav>
                <h1 className="text-3xl font-bold text-white mb-1">News</h1>
                <p className="text-gray-400">Latest updates and articles</p>
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

            {sortedNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {sortedNews.map((article) => (
                  <NewsCard key={article.id} {...article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No articles found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default News;
