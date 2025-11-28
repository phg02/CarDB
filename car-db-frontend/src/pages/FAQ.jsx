import { useState, useEffect } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openItems, setOpenItems] = useState(["item-1"]);

  const categories = ["All", "Car", "Buy", "Sell", "Privacy"];

  const faqData = [
    {
      id: "item-1",
      category: "Car",
      question: "How to compare car?",
      answer:
        "Accumsan urna, posuere non viverra varius fringilla urna enim. Etiam congue faucibus arcu mauris risus massa nisl. Amet, imperdiet risus adipiscing est ullamcorper sit amet, vitae arcu. Quis consectetur ut urna, at sem rhoncus, scelerisque vitae. Semper amet neque enim diam. Risus sed nisl tincidunt morbi commodo ut tortor ornare integer. Arcu dolor, eget tellus, quis arcu tellus risus molestie. Felis ornare turpis ut nullam. Fames ac urna, ac felis. Vel eget dui arcu, netus ullamcorper massa massa non. Scelerisque posuere eget sit placerat sed libero non feugiat felis.",
    },
    {
      id: "item-2",
      category: "Car",
      question: "Where to find car review?",
      answer:
        "You can find car reviews in our Review section. Navigate to the main page and scroll down to the Latest Review section, or use the search functionality to find specific car models and their detailed reviews.",
    },
    {
      id: "item-3",
      category: "Car",
      question: "What cause the web error?",
      answer:
        "Web errors can be caused by various factors including network connectivity issues, server problems, browser cache, or incorrect URLs. Try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, please contact our support team.",
    },
    {
      id: "item-4",
      category: "Buy",
      question: "How do I purchase a car?",
      answer:
        "To purchase a car, browse our listings, select a car you're interested in, and click the 'Buy Now' button. Follow the checkout process to complete your purchase. You can also contact the seller directly for more information.",
    },
    {
      id: "item-5",
      category: "Buy",
      question: "What payment methods are accepted?",
      answer:
        "We accept various payment methods including credit cards, debit cards, bank transfers, and financing options. All transactions are secure and encrypted for your safety.",
    },
    {
      id: "item-6",
      category: "Sell",
      question: "How do I list my car for sale?",
      answer:
        "To list your car, create an account, click on 'Sell Your Car', and fill out the listing form with your car's details, photos, and pricing information. Our team will review and approve your listing within 24 hours.",
    },
    {
      id: "item-7",
      category: "Sell",
      question: "What are the listing fees?",
      answer:
        "We offer competitive listing fees based on your chosen package. Basic listings are free, while premium listings with additional features start at $49. Contact our sales team for detailed pricing information.",
    },
    {
      id: "item-8",
      category: "Privacy",
      question: "How is my personal information protected?",
      answer:
        "We take your privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent. Read our Privacy Policy for more details.",
    },
    {
      id: "item-9",
      category: "Privacy",
      question: "Can I delete my account?",
      answer:
        "Yes, you can delete your account at any time from your account settings. Please note that deleting your account will remove all your listings and saved information permanently.",
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleItem = (itemId) => {
    setOpenItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredFAQ = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black">    

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20 pt-8">
        {/* Title and Search */}
        <div className="mb-12">
          <p className="text-muted-foreground">Homepage / FAQ</p>

          <h2 className="text-3xl font-bold text-foreground mb-2">
            FREQUENTLY ASKED QUESTION
          </h2>
          <p className="text-muted-foreground mb-8">
            Et proin eu, ut lectus nibh nullam tortor mi.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto ">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 border border-border sticky top-24">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Categories
              </h3>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content - FAQ Accordion */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredFAQ.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-card rounded-lg border border-border overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left px-6 py-6 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-lg font-semibold text-foreground pr-4">
                      {faq.question}
                    </span>
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openItems.includes(faq.id) && (
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQ.length === 0 && (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground text-lg">
                  No results found for "{searchQuery}"
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg z-50 flex items-center justify-center transition-all hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default FAQ;
