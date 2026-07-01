/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Sparkles, BookOpen, Star, HelpCircle, ArrowRight, ArrowLeft, Heart, 
  ShoppingBag, ShieldAlert, CheckCircle2, ChevronDown, ChevronRight, 
  Search, BookCheck, User, Compass, Landmark, Users, MessageSquare, Download 
} from "lucide-react";

import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import AIChatbot from "./components/AIChatbot.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import BookDetailModal from "./components/BookDetailModal.tsx";
import CartCheckout from "./components/CartCheckout.tsx";
import ResourcesList from "./components/ResourcesList.tsx";

import { Book, BlogPost, CartItem, Order, User as UserProfile } from "./types.js";

export default function App() {
  const [currentPage, setCurrentPage] = React.useState<string>("home");
  const [darkMode, setDarkMode] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);

  // Active Catalog & Data lists
  const [books, setBooks] = React.useState<Book[]>([]);
  const [blogs, setBlogs] = React.useState<BlogPost[]>([]);
  const [loadingBooks, setLoadingBooks] = React.useState<boolean>(true);

  // Filter States inside Books Shop
  const [selectedAgeGroup, setSelectedAgeGroup] = React.useState<string>("all");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // AI Semantic Search States
  const [aiSearchQuery, setAiSearchQuery] = React.useState<string>("");
  const [aiSearchResults, setAiSearchResults] = React.useState<any[] | null>(null);
  const [aiSearchLoading, setAiSearchLoading] = React.useState<boolean>(false);

  // User Cart & Wishlist
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [userEmail, setUserEmail] = React.useState<string>("otoofredanaaayorkor@gmail.com");
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);

  // Active Modal detail
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [activeBlog, setActiveBlog] = React.useState<BlogPost | null>(null);

  // FAQ Expanded indices
  const [faqOpen, setFaqOpen] = React.useState<Record<number, boolean>>({});

  // E-Reader sandbox states
  const [activeReaderBook, setActiveReaderBook] = React.useState<Book | null>(null);
  const [readerPage, setReaderPage] = React.useState<number>(1);

  // Bulk Request Quote form
  const [bulkBookId, setBulkBookId] = React.useState<string>("anayas-first-prayer");
  const [bulkQty, setBulkQty] = React.useState<number>(30);
  const [churchName, setChurchName] = React.useState("");
  const [bulkSubmitted, setBulkSubmitted] = React.useState(false);

  // Contact Form
  const [contactName, setContactName] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactMessage, setContactMessage] = React.useState("");
  const [contactSubmitted, setContactSubmitted] = React.useState(false);

  React.useEffect(() => {
    // Apply Dark mode style to raw html body tag if requested
    const bodyClass = document.body.classList;
    if (darkMode) {
      bodyClass.add("dark", "bg-brand-charcoal", "text-brand-cream");
      bodyClass.remove("bg-brand-cream", "text-stone-800");
    } else {
      bodyClass.remove("dark", "bg-brand-charcoal", "text-brand-cream");
      bodyClass.add("bg-brand-cream", "text-stone-800");
    }
  }, [darkMode]);

  const loadData = () => {
    setLoadingBooks(true);
    Promise.all([
      fetch("/api/books").then(res => res.json()),
      fetch("/api/blogs").then(res => res.json())
    ])
      .then(([booksData, blogsData]) => {
        setBooks(booksData);
        setBlogs(blogsData);
        setLoadingBooks(false);
      })
      .catch((err) => {
        console.error("Error fetching data", err);
        setLoadingBooks(false);
      });
  };

  React.useEffect(() => {
    loadData();
  }, []);

  React.useEffect(() => {
    if (userEmail) {
      fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      })
        .then((res) => res.json())
        .then((data) => {
          setUserProfile(data);
          setWishlist(data.wishlist || []);
        })
        .catch((err) => console.error("Error loading user profile", err));
    }
  }, [userEmail]);

  const handleToggleWishlist = async (bookId: string) => {
    if (!userEmail) return;
    try {
      const response = await fetch("/api/users/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, bookId })
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUserProfile(updatedUser);
        setWishlist(updatedUser.wishlist || []);
      }
    } catch (err) {
      console.error("Error toggling wishlist", err);
    }
  };

  const handleAddToCartFromWishlist = (book: Book) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.bookId === book.id && item.format === "physical");
      if (exists) {
        return prev.map((item) =>
          item.bookId === book.id && item.format === "physical"
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { bookId: book.id, book, quantity: 1, format: "physical" }];
    });
    setCurrentPage("cart");
  };

  const handleAISemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) return;

    setAiSearchLoading(true);
    setAiSearchResults(null);

    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiSearchQuery })
      });

      if (response.ok) {
        const results = await response.json();
        setAiSearchResults(results);
      }
    } catch (err) {
      console.error("AI Semantic Search failed", err);
    } finally {
      setAiSearchLoading(false);
    }
  };

  // Pre-seed search queries for parents
  const handleAIQueryTap = (query: string) => {
    setAiSearchQuery(query);
    // Directly submit query
    setAiSearchLoading(true);
    fetch("/api/ai/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    })
      .then((res) => res.json())
      .then((results) => {
        setAiSearchResults(results);
        setAiSearchLoading(false);
      })
      .catch(() => setAiSearchLoading(false));
  };

  const faqList = [
    { q: "Are the stories strictly biblical?", a: "Yes. Every story published by The AnayaSeries is rooted in standard Biblical concepts, direct scriptures, and loving Christian moral principles, designed under the advice of pastors and Sunday school teachers." },
    { q: "How long does shipping take for physical hardcover books?", a: "We ship orders within 1-2 business days. Standard physical delivery takes 3-5 business days within the United States. Church/bulk bulk boxes can take up to 7 business days." },
    { q: "How do I download purchased digital books?", a: "Once you purchase a digital book format via PayPal sandbox, log in to your account tab using your checkout email address. You will instantly see your PDFs under 'My Digital Bookshelf' where you can read online or download." },
    { q: "Can I use the coloring resources in my school classroom?", a: "Absolutely! Our free printable resources under the 'Free Resources' page are fully licensed for home families, Christian schools, VBS, and Sunday congregations. Simply register your email to unlock." },
    { q: "Who writes and illustrates these books?", a: "Joanna and David Anaya are parent writers who draft the scripts based on raising their own young children. We partner with specialized Christian child illustrators to make the pages warm, eye-safe, and incredibly detailed." }
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${
      darkMode ? "bg-brand-charcoal text-brand-cream" : "bg-brand-cream text-brand-charcoal"
    }`}>
      
      {/* Navigation header */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        cart={cart}
        wishlist={wishlist}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
      />

      {/* Main Routing Container */}
      <main className="flex-grow">
        
        {/* PAGE 1: HOME PAGE */}
        {currentPage === "home" && (
          <div className="space-y-24 pb-20">
            
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 sm:pb-28">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Left Col */}
                <div className="space-y-6 max-w-xl">
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-green/10 px-3.5 py-2 rounded-full border border-brand-green/25">
                    🕊️ Inspire Their Hearts Daily
                  </span>
                  <h1 className="font-serif text-4xl sm:text-6xl font-black text-brand-green tracking-tight leading-none">
                    Sowing Seeds of <span className="text-brand-gold italic">Scripture</span>, Wisdom & Faith
                  </h1>
                  <p className="text-sm sm:text-base text-stone-600 leading-relaxed dark:text-stone-300">
                    Discover premium illustrated children's books and printable crafts designed to connect toddlers and pre-teens with Bible truths through warm, captivating Christian stories.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => setCurrentPage("store")}
                      className="bg-brand-green hover:bg-brand-green-light text-brand-cream px-6 py-3.5 rounded-full text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <span>Explore Books Shop</span>
                      <ArrowRight className="w-4 h-4 text-brand-gold" />
                    </button>
                    <button
                      onClick={() => setCurrentPage("resources")}
                      className="bg-white hover:bg-stone-50 border border-stone-300 dark:bg-stone-800 dark:border-stone-700 dark:hover:bg-stone-700/60 text-stone-700 dark:text-stone-200 px-6 py-3.5 rounded-full text-xs font-semibold cursor-pointer text-center"
                    >
                      Get Free Sunday Activities
                    </button>
                  </div>
                </div>

                {/* Right Col: Illustrated Mockup Grid */}
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="bg-white p-3 rounded-2xl shadow-lg border border-stone-100 rotate-2 hover:rotate-0 transition-transform cursor-pointer" onClick={() => setSelectedBook(books[0])}>
                        <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400" className="rounded-xl aspect-[3/4] object-cover" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl shadow-lg border border-stone-100 -rotate-3 hover:rotate-0 transition-transform cursor-pointer" onClick={() => setSelectedBook(books[2])}>
                        <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400" className="rounded-xl aspect-[3/4] object-cover" />
                      </div>
                    </div>
                    <div className="space-y-4 pt-8">
                      <div className="bg-white p-3 rounded-2xl shadow-lg border border-stone-100 -rotate-1 hover:rotate-0 transition-transform cursor-pointer" onClick={() => setSelectedBook(books[1])}>
                        <img src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400" className="rounded-xl aspect-[3/4] object-cover" />
                      </div>
                      <div className="bg-white p-3 rounded-2xl shadow-md border border-stone-100 rotate-3 hover:rotate-0 transition-transform cursor-pointer" onClick={() => setSelectedBook(books[3])}>
                        <img src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400" className="rounded-xl aspect-[3/4] object-cover" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* AI SEMANTIC STORY SEARCH ENGINE BAR */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-3xl p-8 sm:p-10 space-y-6 relative overflow-hidden">
                <div className="max-w-xl space-y-2 relative z-10">
                  <span className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
                    <span>AI Story finder</span>
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-green">
                    What faith values are you teaching today?
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Search using natural parenting language (e.g. "I want a bedtime story on Caleb courage", "stories about honey bees praising God", or "how to explain generous sunflower seeds"). Our semantic engine ranks matching chapters instantly!
                  </p>
                </div>

                {/* Form search box */}
                <form onSubmit={handleAISemanticSearch} className="max-w-2xl relative z-10 flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Search className="h-4.5 w-4.5 text-stone-400" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Type e.g., Bedtime book teaching young children to pray daily..."
                      value={aiSearchQuery}
                      onChange={(e) => setAiSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-charcoal dark:text-brand-cream shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={aiSearchLoading}
                    className="bg-brand-green hover:bg-brand-green-light text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {aiSearchLoading ? "Searching..." : "Ask AI Search"}
                  </button>
                </form>

                {/* AI Search results expanded */}
                {aiSearchResults && (
                  <div className="bg-white dark:bg-stone-900 border dark:border-stone-800 rounded-2xl p-4 sm:p-6 space-y-4 relative z-10 shadow-lg">
                    <div className="flex justify-between items-center border-b pb-2 text-xs">
                      <span className="font-bold text-brand-green">Ranked Search Matches:</span>
                      <button onClick={() => setAiSearchResults(null)} className="text-stone-400 hover:text-stone-600 font-bold">Clear X</button>
                    </div>

                    <div className="divide-y max-h-60 overflow-y-auto pr-1">
                      {aiSearchResults.length === 0 ? (
                        <p className="text-xs text-stone-400 italic">No semantic match found for this query. Try using simpler themes.</p>
                      ) : (
                        aiSearchResults.map((res: any, idx: number) => {
                          const matchedBook = books.find(b => b.id === res.id);
                          const matchedBlog = blogs.find(b => b.id === res.id);
                          const title = matchedBook ? matchedBook.title : (matchedBlog ? matchedBlog.title : "Article");
                          
                          return (
                            <div key={idx} className="py-3 flex items-start justify-between gap-4 text-xs">
                              <div>
                                <span className="text-[9px] bg-brand-gold/20 text-brand-gold-dark px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  {res.type === "book" ? "📖 Book" : "✍️ Blog Article"} (Match: {res.relevanceScore}%)
                                </span>
                                <h4 className="font-serif font-bold text-sm text-brand-green mt-1">{title}</h4>
                                <p className="text-stone-500 italic mt-1 leading-relaxed">"{res.matchingQuote}"</p>
                              </div>
                              <button
                                onClick={() => {
                                  if (matchedBook) setSelectedBook(matchedBook);
                                  else if (matchedBlog) { setActiveBlog(matchedBlog); setCurrentPage("blog"); }
                                }}
                                className="bg-brand-green/10 hover:bg-brand-green text-brand-green hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer shrink-0 transition-colors"
                              >
                                View Match
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Preseed chips */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-stone-400 self-center font-medium">Quick prompt filters:</span>
                  <button onClick={() => handleAIQueryTap("book on prayer with Philippians bible verse")} className="bg-white/50 dark:bg-stone-800/40 hover:bg-[#C5A059]/20 border border-brand-gold/25 rounded-full px-3 py-1 text-[11px] text-[#A68343] font-medium cursor-pointer shadow-sm">
                    🙏 Prayer Book
                  </button>
                  <button onClick={() => handleAIQueryTap("Caleb sheperd boy psalm 23 courage story")} className="bg-white/50 dark:bg-stone-800/40 hover:bg-[#C5A059]/20 border border-brand-gold/25 rounded-full px-3 py-1 text-[11px] text-[#A68343] font-medium cursor-pointer shadow-sm">
                    🦁 Caleb Shepherd
                  </button>
                  <button onClick={() => handleAIQueryTap("activity book coloring word search kids")} className="bg-white/50 dark:bg-stone-800/40 hover:bg-[#C5A059]/20 border border-brand-gold/25 rounded-full px-3 py-1 text-[11px] text-[#A68343] font-medium cursor-pointer shadow-sm">
                    ✏️ Activity Crafts
                  </button>
                </div>
              </div>
            </section>

            {/* Featured Book slider banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-green/10 px-3 py-1.5 rounded-full border border-brand-green/25">
                  Handpicked Bedtime Selections
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green mt-4">Featured Story Releases</h2>
              </div>

              {loadingBooks ? (
                <div className="text-center py-10 animate-pulse text-stone-400 text-xs">
                  <BookOpen className="w-8 h-8 animate-bounce text-brand-green/40 mx-auto mb-2" />
                  <span>Loading bookshelf catalog...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {books.filter(b => b.isFeatured).map((book) => (
                    <div
                      key={book.id}
                      className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 premium-shadow premium-shadow-hover ${
                        darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
                      }`}
                    >
                      {/* Image block */}
                      <div className="h-64 bg-stone-100 relative cursor-pointer" onClick={() => setSelectedBook(book)}>
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute top-3 left-3 bg-brand-green text-white text-[10px] font-bold px-3 py-1 rounded-full border border-brand-gold/15 shadow">
                          Ages {book.ageRange}
                        </span>
                      </div>

                      {/* Info body */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex gap-1 flex-wrap">
                            {book.categories.map((c, cIdx) => (
                              <span key={cIdx} className="text-[9px] font-bold text-brand-gold uppercase tracking-wider">{c}</span>
                            ))}
                          </div>
                          <h3
                            onClick={() => setSelectedBook(book)}
                            className="font-serif text-xl font-bold tracking-tight text-brand-green mt-2 hover:text-[#C5A059] transition-colors cursor-pointer"
                          >
                            {book.title}
                          </h3>
                          <p className="text-stone-400 text-xs italic mt-0.5 leading-tight">{book.subtitle}</p>
                          <p className="text-stone-500 text-xs mt-2.5 line-clamp-2 leading-relaxed">{book.description}</p>
                        </div>

                        {/* Buy section */}
                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800/40 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-stone-400 block font-semibold">HARDOVER BOOK</span>
                            <span className="text-base font-serif font-bold text-brand-green">${book.pricePhysical}</span>
                          </div>
                          
                          <button
                            onClick={() => setSelectedBook(book)}
                            className="bg-brand-green hover:bg-brand-green-light text-brand-cream px-4.5 py-2 rounded-full text-xs font-bold shadow flex items-center gap-1 cursor-pointer border border-brand-gold/10"
                          >
                            <span>Read Story details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Shop by Age Group grid */}
            <section className="bg-brand-cream-dark/30 py-20 border-y border-brand-cream-dark">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-green/10 px-3 py-1.5 rounded-full border border-brand-green/25">
                    Targeted Faith Formation
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green mt-4 mb-4">Explore by Age Suitability</h2>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                    Stories tailored to their vocabulary level, illustration density, and depth of scriptural lessons. Select an age group below to view custom tailored books.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { id: "0-2", title: "Ages 0-2 (Toddlers)", bg: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400", desc: "Short nursery rhymes and simple praise creation board books." },
                    { id: "3-5", title: "Ages 3-5 (Preschool)", bg: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400", desc: "Interactive prayer habits, sharing sunflower seeds, and toddler verses." },
                    { id: "6-8", title: "Ages 6-8 (Early Reader)", bg: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400", desc: "Brave shepherd boy, overcoming childhood fears, and family trackers." },
                    { id: "9-11", title: "Ages 9-11 (Pre-teens)", bg: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400", desc: "Moral character building proverbs, active patience, and Bible wisdom." }
                  ].map((ageCard) => (
                    <div
                      key={ageCard.id}
                      onClick={() => {
                        setSelectedAgeGroup(ageCard.id);
                        setCurrentPage("store");
                      }}
                      className="group relative h-80 rounded-2xl overflow-hidden shadow-md cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
                    >
                      {/* Image background overlay */}
                      <div className="absolute inset-0 bg-black/55 group-hover:bg-black/60 transition-colors z-10" />
                      <img src={ageCard.bg} className="absolute inset-0 w-full h-full object-cover" />
                      
                      {/* Text content absolute */}
                      <div className="absolute inset-x-0 bottom-0 p-6 z-20 space-y-2 text-white">
                        <span className="text-[10px] text-brand-gold uppercase tracking-widest font-black">Age suitability</span>
                        <h3 className="font-serif text-lg font-bold tracking-tight">{ageCard.title}</h3>
                        <p className="text-xs text-stone-200 leading-relaxed line-clamp-2">{ageCard.desc}</p>
                        <div className="flex items-center text-[10px] font-bold text-brand-gold gap-1 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Browse Age Books</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>
        )}

        {/* PAGE 2: ABOUT THE ANAYASERIES */}
        {currentPage === "about" && (
          <div className="py-16 space-y-20 max-w-5xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-green/10 px-3.5 py-1.5 rounded-full border border-brand-green/25">
                Our Story & Mission
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green tracking-tight">Meet the Anaya Family</h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                We are Joanna and David Anaya, parent writers based in Texas, on a humble mission to provide premium, faith-enriching children's literature to households, congregations, and schools worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <img
                src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600"
                alt="David and Joanna"
                className="rounded-3xl shadow-xl border object-cover h-[450px]"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-brand-green">Why We Started "The AnayaSeries"</h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  As our children grew, we realized how difficult it was to find illustrated storybooks that paired highly aesthetic, modern illustrations with uncompromising Christian scriptural depth. Many books felt too generic or diluted the biblical core.
                </p>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  So, we began writing! The AnayaSeries is formed with a strict commitment: every story couples with a specific verse, outlines a clear family moral lesson, and comes packed with parenting discussion questions. We want our storybooks to be more than entertainment; we want them to be lifelong faith triggers.
                </p>

                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-serif text-lg font-bold text-brand-green">Our Core Storytelling Checklist:</h4>
                  <ul className="space-y-2 text-xs text-stone-500">
                    <li className="flex items-center gap-2">
                      <BookCheck className="w-4.5 h-4.5 text-brand-gold shrink-0" />
                      <span>100% Biblical Scriptural foundations.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <BookCheck className="w-4.5 h-4.5 text-brand-gold shrink-0" />
                      <span>Premium eye-safe illustration designs.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <BookCheck className="w-4.5 h-4.5 text-brand-gold shrink-0" />
                      <span>Home discussion questions included.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <BookCheck className="w-4.5 h-4.5 text-brand-gold shrink-0" />
                      <span>Active printable activity booklets mapped to every story.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3: BOOKS STORE (CATALOG) */}
        {currentPage === "store" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Title */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green">The Storybook Store</h2>
              <p className="text-xs text-stone-500">Filters catalog books by age suitability ranges or core spiritual lesson categories.</p>
            </div>

            {/* Filter controls row */}
            <div className="bg-stone-50 dark:bg-stone-900/10 border p-6 rounded-2xl space-y-4 flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Category selector row */}
              <div className="flex flex-wrap gap-2 text-xs">
                {["all", "Prayer", "Bible Stories", "Creation", "Wisdom", "Generosity"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1.5 px-3 rounded-full cursor-pointer transition-all ${
                      selectedCategory === cat 
                        ? "bg-brand-green text-white font-bold" 
                        : "bg-white dark:bg-stone-800 border text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {cat === "all" ? "All Lesson Categories" : cat}
                  </button>
                ))}
              </div>

              {/* Age selector row */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-stone-400 font-medium">Filter Age suitability:</span>
                <select
                  value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value)}
                  className="border rounded-lg px-2 py-1.5 bg-transparent"
                >
                  <option value="all">All Ages (0-11)</option>
                  <option value="0-2">Ages 0-2 (Toddlers)</option>
                  <option value="3-5">Ages 3-5 (Early Years)</option>
                  <option value="6-8">Ages 6-8 (Young Reader)</option>
                  <option value="9-11">Ages 9-11 (Pre-teens)</option>
                </select>
              </div>

            </div>

            {/* Books display grid */}
            {loadingBooks ? (
              <div className="text-center py-20 text-stone-400 animate-pulse text-xs">
                <BookOpen className="w-10 h-10 animate-bounce mx-auto mb-2 text-brand-green/35" />
                <span>Opening story library...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {books
                  .filter((b) => selectedAgeGroup === "all" || b.ageRange === selectedAgeGroup)
                  .filter((b) => selectedCategory === "all" || b.categories.includes(selectedCategory))
                  .map((book) => (
                    <div
                      key={book.id}
                      className={`rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between premium-shadow premium-shadow-hover ${
                        darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
                      }`}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 cursor-pointer" onClick={() => setSelectedBook(book)}>
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute top-3 left-3 bg-brand-green text-white text-[10px] font-bold px-3 py-1 rounded-full border border-brand-gold/15 shadow">
                          Ages {book.ageRange}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex gap-1 flex-wrap">
                            {book.categories.map((c, cIdx) => (
                              <span key={cIdx} className="text-[9px] font-bold text-brand-gold uppercase tracking-wider">{c}</span>
                            ))}
                          </div>
                          <h3
                            onClick={() => setSelectedBook(book)}
                            className="font-serif text-lg font-bold tracking-tight text-brand-green mt-2 hover:text-[#C5A059] transition-colors cursor-pointer"
                          >
                            {book.title}
                          </h3>
                          <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">By {book.author}</p>
                          <p className="text-stone-500 text-xs mt-2 line-clamp-2 leading-relaxed">{book.description}</p>
                        </div>

                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800/40 flex items-center justify-between">
                          <div>
                            <span className="text-[8.5px] text-stone-400 block font-bold">HARDCOVER</span>
                            <span className="text-base font-serif font-bold text-brand-green">${book.pricePhysical}</span>
                          </div>

                          <button
                            onClick={() => setSelectedBook(book)}
                            className="bg-brand-green hover:bg-brand-green-light text-brand-cream px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer border border-brand-gold/10"
                          >
                            <span>Read details</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

          </div>
        )}

        {/* PAGE 4: FREE RESOURCES (GATED COLORINGS) */}
        {currentPage === "resources" && (
          <ResourcesList darkMode={darkMode} />
        )}

        {/* PAGE 5: FAITH BLOG (MAGAZINE STYLE) */}
        {currentPage === "blog" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {activeBlog ? (
              // Read single article expanded view
              <div className="max-w-3xl mx-auto space-y-6">
                <button
                  onClick={() => setActiveBlog(null)}
                  className="flex items-center space-x-1 text-xs font-bold text-stone-500 hover:text-brand-green cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Blog Articles</span>
                </button>

                <div className="space-y-4">
                  <span className="text-xs bg-brand-gold/20 text-brand-gold-dark px-3 py-1.5 rounded-full font-bold uppercase">
                    {activeBlog.category}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-black text-brand-green tracking-tight leading-tight">
                    {activeBlog.title}
                  </h2>
                  <p className="font-serif text-lg text-stone-400 italic">{activeBlog.subtitle}</p>
                  
                  <div className="flex gap-4 text-xs text-stone-500 font-mono border-y py-3">
                    <span>By {activeBlog.author}</span>
                    <span>·</span>
                    <span>{new Date(activeBlog.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{activeBlog.readTime}</span>
                  </div>
                </div>

                <img
                  src={activeBlog.imageUrl}
                  alt={activeBlog.title}
                  className="w-full h-80 object-cover rounded-3xl border shadow-lg"
                  referrerPolicy="no-referrer"
                />

                {/* Markdown content rendering */}
                <div className="prose max-w-none dark:prose-invert space-y-4 text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300">
                  {activeBlog.content.split("\n\n").map((chunk, cIdx) => {
                    if (chunk.startsWith("### ")) {
                      return <h3 key={cIdx} className="font-serif font-bold text-xl text-brand-green pt-4">{chunk.replace("### ", "")}</h3>;
                    }
                    if (chunk.startsWith("* ")) {
                      return (
                        <ul key={cIdx} className="list-disc pl-5 space-y-1">
                          {chunk.split("\n").map((li, lIdx) => (
                            <li key={lIdx}>{li.replace("* ", "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={cIdx}>{chunk}</p>;
                  })}
                </div>

                {/* Parenting devotion box coupon banner */}
                <div className="bg-brand-gold/15 border border-brand-gold/40 rounded-2xl p-6 text-center space-y-4 mt-12">
                  <Sparkles className="w-6 h-6 text-brand-gold mx-auto animate-bounce" />
                  <h4 className="font-serif font-bold text-lg text-brand-green">Parenting Faith Formation Digest</h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                    Enjoying these home devotion ideas? We dispatch monthly printables and story reflections directly. Join our gated list free.
                  </p>
                </div>
              </div>
            ) : (
              // Blog list view
              <div className="space-y-12">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-green/10 px-3 py-1.5 rounded-full border border-brand-green/25">
                    Parenting & Sunday Devotionals
                  </span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green tracking-tight">The Faith Magazine</h2>
                  <p className="text-xs text-stone-500">Practical ideas, family reflection guides, and stories to share in the living room.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                  {blogs.map((post) => (
                    <div
                      key={post.id}
                      className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 premium-shadow premium-shadow-hover ${
                        darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
                      }`}
                    >
                      <div className="h-56 relative cursor-pointer" onClick={() => setActiveBlog(post)}>
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute top-3 left-3 bg-brand-gold text-brand-green-dark text-[10px] font-bold px-3 py-1 rounded-full shadow uppercase tracking-widest">
                          {post.category}
                        </span>
                      </div>

                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div>
                          <h3
                            onClick={() => setActiveBlog(post)}
                            className="font-serif text-xl font-bold text-brand-green hover:text-brand-gold cursor-pointer transition-colors leading-tight"
                          >
                            {post.title}
                          </h3>
                          <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mt-1">Written by {post.author}</p>
                          <p className="text-stone-500 text-xs mt-3.5 line-clamp-3 leading-relaxed">{post.subtitle}</p>
                        </div>

                        <button
                          onClick={() => setActiveBlog(post)}
                          className="text-xs text-brand-green font-bold flex items-center gap-1 hover:text-brand-gold transition-colors pt-2 border-t w-full text-left"
                        >
                          <span>Read Full Article</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* PAGE 6: SCHOOLS & CHURCHES LANDING */}
        {currentPage === "schools" && (
          <div className="py-12 max-w-5xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-green/10 px-3.5 py-1.5 rounded-full border border-brand-green/25">
                Sunday School Curriculum & Libraries
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green tracking-tight">Churches & Schools Partnerships</h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                We believe faith-enriching storybooks should be accessible to classroom libraries and Sunday congregations. We offer bulk box pricing (up to 40% off), custom lesson sheets, and sermon-aligned activity guides.
              </p>
            </div>

            {/* Curriculum pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className={`p-6 rounded-2xl border ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow text-center space-y-3`}>
                <div className="w-10 h-10 bg-brand-cream border dark:bg-stone-800 text-brand-gold rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Landmark className="w-5 h-5 text-brand-green" />
                </div>
                <h4 className="font-serif font-bold text-base text-brand-green">Bulk Church Box</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Purchase sets of 15, 30, or 50 hardcovers for classroom lesson guides. Ideal for Children's Ministries and seasonal Vacation Bible School (VBS).
                </p>
              </div>

              <div className={`p-6 rounded-2xl border ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow text-center space-y-3`}>
                <div className="w-10 h-10 bg-brand-cream border dark:bg-stone-800 text-brand-gold rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Users className="w-5 h-5 text-brand-green" />
                </div>
                <h4 className="font-serif font-bold text-base text-brand-green">School Libraries</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Equip early childhood classrooms and elementary libraries with scripture-accurate, beautiful storytelling that meets faith guidelines.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow text-center space-y-3`}>
                <div className="w-10 h-10 bg-brand-cream border dark:bg-stone-800 text-brand-gold rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Compass className="w-5 h-5 text-brand-green" />
                </div>
                <h4 className="font-serif font-bold text-base text-brand-green">VBS Custom Packs</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  We supply hand-drawn colorings, memory matching activities, and customized coloring bundles that align with your church's seasonal themes.
                </p>
              </div>

            </div>

            {/* Request form bulk box */}
            <div className={`p-8 rounded-3xl border ${darkMode ? "bg-stone-[#232221] border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-brand-green">Request a Sunday School Bulk Quote</h3>
                  <p className="text-xs text-stone-500 mt-1">Select a book and target quantity. Our publishing desk responds with custom discount structures in 24 hours.</p>
                </div>

                {bulkSubmitted ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-serif font-bold text-lg text-brand-green">Inquiry Transmitted!</h4>
                    <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
                      Thank you for your devotion. Joanna will prepare a customized bulk-pricing quote with sermon templates and contact your church at the provided email.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setBulkSubmitted(true); }} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-400 uppercase">Target Storybook</label>
                        <select
                          value={bulkBookId}
                          onChange={(e) => setBulkBookId(e.target.value)}
                          className="w-full border rounded-xl px-3 py-2 bg-transparent"
                        >
                          <option value="anayas-first-prayer">Anaya's First Prayer</option>
                          <option value="the-brave-shepherd">The Brave Shepherd</option>
                          <option value="miracles-in-the-meadow">Miracles in the Meadow</option>
                          <option value="wisdom-of-the-oak">Wisdom of the Oak</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-400 uppercase">Approx Quantity</label>
                        <input
                          type="number"
                          required
                          min="10"
                          value={bulkQty}
                          onChange={(e) => setBulkQty(Number(e.target.value))}
                          className="w-full border rounded-xl px-3 py-2 bg-transparent"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-400 uppercase">Church / School Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Grace Fellowship"
                          value={churchName}
                          onChange={(e) => setChurchName(e.target.value)}
                          className="w-full border rounded-xl px-3 py-2 bg-transparent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-400 uppercase">Coordinator Email</label>
                        <input
                          type="email"
                          required
                          placeholder="pastor@church.com"
                          className="w-full border rounded-xl px-3 py-2 bg-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-3 px-6 rounded-xl text-xs shadow cursor-pointer flex items-center space-x-1"
                    >
                      <span>Submit Bulk Box Request</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAGE 7: PARENTS CORNER */}
        {currentPage === "parents" && (
          <div className="py-12 max-w-4xl mx-auto px-4 space-y-16">
            <div className="text-center space-y-4 max-w-xl mx-auto">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-green/10 px-3.5 py-1.5 rounded-full border border-brand-green/25">
                Family Milestones & Reading Trackers
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green tracking-tight">Parents Reading Corner</h2>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Practical parenting tips, family discussion helpers, and prayer trackers designed to turn bedroom storytime into faith-forming bedtime moments.
              </p>
            </div>

            {/* Daily Faith habit card bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className={`p-6 rounded-2xl border ${darkMode ? "bg-stone-[#232221] border-stone-800" : "bg-white border-stone-200"} premium-shadow space-y-4`}>
                <span className="text-[9px] bg-brand-gold/20 text-brand-gold-dark px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Morning Habit</span>
                <h4 className="font-serif font-bold text-lg text-brand-green">The 3-Sentence Morning Sparkle</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Help your child wake up aligned to gratitude. Before they step out of bed, repeat these three simple focus lines with them:
                </p>
                <div className="bg-stone-50 dark:bg-stone-900/30 p-4 rounded-xl text-xs italic font-serif leading-relaxed text-stone-600 space-y-1.5">
                  <p>1. "Thank you, God, for this bright new morning."</p>
                  <p>2. "Help my feet walk in kindness on the playground today."</p>
                  <p>3. "I am safe and loved under your shepherd shield."</p>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${darkMode ? "bg-stone-[#232221] border-stone-800" : "bg-white border-stone-200"} premium-shadow space-y-4`}>
                <span className="text-[9px] bg-brand-gold/20 text-brand-gold-dark px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Bedtime Habit</span>
                <h4 className="font-serif font-bold text-lg text-brand-green">The High-Low-Grace bedtime check</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Before turning off the bedroom lights, sit on the edge of their bed and prompt a high-low-grace review of their day:
                </p>
                <ul className="space-y-2 text-xs text-stone-600 pl-4 list-disc leading-relaxed">
                  <li><strong>The High:</strong> "What is a happy moment you thank God for today?"</li>
                  <li><strong>The Low:</strong> "What felt tough, scary, or sad?"</li>
                  <li><strong>The Grace:</strong> "How did we see God's kindness or learn forgiveness today?"</li>
                </ul>
              </div>

            </div>

            {/* AI Assistant Callout */}
            <div className="rounded-3xl bg-brand-green text-white p-8 sm:p-10 border border-brand-gold/15 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 justify-between">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-brand-gold animate-bounce" />
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-brand-gold/25">AI Companion ready</span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight">Need a custom Bedtime Lesson idea?</h3>
                <p className="text-xs text-stone-200 leading-relaxed">
                  Open our interactive floating assistant **AnayaHelper** at the bottom-right of your screen! You can ask it to suggest custom Bible analogies matching your child's specific school playground feelings.
                </p>
              </div>
              <button
                onClick={() => handleAIQueryTap("Suggest a bedtime bedtime lesson about learning to share and say sorry")}
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-green-dark px-5 py-3 rounded-xl text-xs font-bold shadow-md cursor-pointer shrink-0 transition-all flex items-center gap-1"
              >
                <span>Generate sharing lesson</span>
              </button>
            </div>
          </div>
        )}

        {/* PAGE 8: FAQs ACCORDION */}
        {currentPage === "faq" && (
          <div className="py-12 max-w-3xl mx-auto px-4 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green tracking-tight">Frequently Asked Questions</h2>
              <p className="text-xs text-stone-500">Find quick details about our publishing standards, sandbox payment processing, and download gates.</p>
            </div>

            <div className="space-y-4">
              {faqList.map((faq, idx) => {
                const isOpen = faqOpen[idx];
                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"
                    }`}
                  >
                    <button
                      onClick={() => setFaqOpen((prev) => ({ ...prev, [idx]: !isOpen }))}
                      className="w-full px-5 py-4.5 flex justify-between items-center text-left text-sm font-bold text-brand-green cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-brand-gold transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-500 leading-relaxed border-t border-stone-100 dark:border-stone-800/40 mt-1">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PAGE 9: CONTACT */}
        {currentPage === "contact" && (
          <div className="py-12 max-w-xl mx-auto px-4 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green tracking-tight">Contact Publishing</h2>
              <p className="text-xs text-stone-500">Have questions about bulk church orders, homeschooling support, or delivery tracking?</p>
            </div>

            <div className={`p-6 rounded-3xl border ${darkMode ? "bg-stone-[#232221] border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
              {contactSubmitted ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-serif font-bold text-lg text-brand-green">Message Transmitted!</h4>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
                    Thank you. David has received your support request. We'll pray over your message and respond to your email address within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-stone-400 uppercase">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pastor Thomas"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2.5 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-stone-400 uppercase">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="thomas@church.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2.5 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-stone-400 uppercase">Support Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can we support your family or children's ministry lessons today?"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2.5 bg-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-green hover:bg-brand-green-light text-white font-bold py-3 rounded-xl shadow cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PAGE 10: USER DASHBOARD ACCOUNT */}
        {currentPage === "account" && (
          <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header login block */}
            <div className="bg-brand-green/10 border p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-[9px] bg-brand-gold/20 text-brand-gold-dark px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  Verified Subscriber Account
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-green mt-1 flex items-center gap-1.5">
                  <User className="w-5 h-5 text-[#C5A059]" />
                  <span>My Digital Bookshelf</span>
                </h2>
                <p className="text-xs text-stone-500">Accessing purchases for: **{userEmail || "Guest User"}**</p>
              </div>

              {/* Enter checkout email mock switch */}
              <div className="flex gap-2 text-xs">
                <input
                  type="email"
                  placeholder="Enter custom checkout email"
                  className="border rounded-xl px-3 py-1.5 bg-white text-xs text-brand-charcoal"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                <button onClick={() => loadData()} className="bg-brand-green text-white rounded-xl px-3 py-1.5 font-bold cursor-pointer">Sync Shelf</button>
              </div>
            </div>

            {/* ILLUSTRATED E-READER SANDBOX INTERFACE */}
            {activeReaderBook && (
              <div className="border-2 border-brand-gold rounded-3xl p-6 sm:p-10 bg-brand-cream-dark/15 space-y-6 relative overflow-hidden">
                <div className="flex justify-between items-center border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <img src={activeReaderBook.imageUrl} alt={activeReaderBook.title} className="w-10 h-14 object-cover rounded shadow border" />
                    <div>
                      <h3 className="font-serif font-black text-lg text-brand-green">{activeReaderBook.title}</h3>
                      <p className="text-[10px] text-stone-400">Illustrations by {activeReaderBook.illustrator}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveReaderBook(null); setReaderPage(1); }}
                    className="bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close Reader X
                  </button>
                </div>

                {/* Simulated E-Reader Pages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-64 py-4">
                  
                  {/* Left illustrated frame */}
                  <div className="aspect-[4/3] bg-stone-100 rounded-2xl overflow-hidden border premium-shadow relative flex items-center justify-center">
                    <img src={activeReaderBook.imageUrl} className="w-full h-full object-cover blur-sm opacity-20 absolute" />
                    <div className="relative z-10 text-center p-6 space-y-3">
                      <BookOpen className="w-12 h-12 text-brand-gold mx-auto animate-pulse" />
                      <p className="font-serif italic text-brand-green font-bold text-sm">
                        [Illustrated Scene: page {readerPage} of {activeReaderBook.pageCount}]
                      </p>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Colorful hand-drawn artwork displaying Caleb protecting his sheep under standard Psalm 23 guidance.
                      </p>
                    </div>
                  </div>

                  {/* Right text page frame */}
                  <div className="space-y-6">
                    <span className="text-[10px] uppercase font-bold text-[#8C867A] tracking-wider block">PAGE {readerPage} SUMMARY TEXT</span>
                    
                    {readerPage === 1 ? (
                      <div className="space-y-4">
                        <p className="font-serif leading-relaxed text-stone-700 dark:text-stone-300 text-sm">
                          Once upon a time in a beautiful sunny pasture, there lived a shepherd boy who loved his sheep dearly. He watched over them day and night, ensuring they always found green meadows and clean, peaceful streams to drink from.
                        </p>
                        <p className="font-serif leading-relaxed text-stone-700 dark:text-stone-300 text-sm">
                          Caleb knew that God was his shield, and that gave him the bravery to overcome any shadow in the wilderness.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="font-serif leading-relaxed text-stone-700 dark:text-stone-300 text-sm">
                          When a sudden storm rolled in over the hills, Caleb stood tall. He held his shepherd's staff and sang a song of praise: "The Lord is my shepherd, I shall not want!"
                        </p>
                        <div className="bg-[#F7F3E9] dark:bg-stone-800 p-4 rounded-xl text-xs space-y-1">
                          <span className="font-bold text-brand-gold uppercase block text-[9px]">BEDTIME LESSON TO REFLECT</span>
                          <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                            Caleb teaches us that we do not have to fear sudden life storms. God's rod and staff are always protecting our small steps!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Page selectors */}
                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        disabled={readerPage === 1}
                        onClick={() => setReaderPage(1)}
                        className="border px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-30"
                      >
                        Prev Page
                      </button>
                      <button
                        disabled={readerPage === 2}
                        onClick={() => setReaderPage(2)}
                        className="bg-brand-green text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-30"
                      >
                        Next Page
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Bookshelf list */}
            <div className="space-y-6">
              <h3 className="font-serif text-2xl font-bold text-brand-green tracking-tight">Licensed Digital PDF Guides</h3>
              
              {userProfile && userProfile.purchasedBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {books
                    .filter((b) => userProfile.purchasedBooks.includes(b.id))
                    .map((book) => (
                      <div
                        key={book.id}
                        className={`p-6 rounded-2xl border flex items-center justify-between gap-6 transition-colors ${
                          darkMode ? "bg-stone-[#232221] border-stone-800" : "bg-white border-stone-200"
                        } premium-shadow`}
                      >
                        <div className="flex items-center space-x-4">
                          <img src={book.imageUrl} alt={book.title} className="w-14 h-20 object-cover rounded shadow border" />
                          <div>
                            <h4 className="font-serif font-bold text-base leading-tight">{book.title}</h4>
                            <p className="text-[10px] text-stone-400 mt-0.5 uppercase tracking-widest">{book.author}</p>
                            <span className="text-[9.5px] bg-brand-gold/20 text-brand-gold-dark px-2 py-0.5 rounded-full font-bold uppercase mt-2 inline-block">
                              Gated License
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => setActiveReaderBook(book)}
                            className="bg-brand-green hover:bg-brand-green-light text-white text-xs px-3.5 py-1.5 rounded-xl font-bold shadow cursor-pointer text-center"
                          >
                            Read Online
                          </button>
                          
                          <a
                            href={book.pdfUrl}
                            download={`${book.id}-storybook-receipt.pdf`}
                            className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs px-3.5 py-1.5 rounded-xl font-semibold cursor-pointer text-center flex items-center justify-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5 text-stone-400" />
                            <span>Download PDF</span>
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">No licensed storybook guides allocated to this email shelf yet.</p>
              )}
            </div>

          </div>
        )}

        {/* PAGE 11: USER WISHLIST */}
        {currentPage === "wishlist" && (
          <div className="py-12 max-w-5xl mx-auto px-4 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-green tracking-tight">My Saved Wishlist</h2>
              <p className="text-xs text-stone-500">Your favorite faith stories saved for future home devotion pre-orders.</p>
            </div>

            {wishlist.length === 0 ? (
              <div className="bg-white dark:bg-[#232221] border p-12 text-center rounded-2xl shadow-sm">
                <p className="text-stone-400 text-sm mb-6">Your wishlist is currently empty. Start browsing our catalog stories!</p>
                <button onClick={() => setCurrentPage("store")} className="bg-brand-green text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                  Explore Shop
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {books
                  .filter((b) => wishlist.includes(b.id))
                  .map((book) => (
                    <div
                      key={book.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                        darkMode ? "bg-stone-[#232221] border-stone-800" : "bg-white border-stone-200"
                      } premium-shadow`}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <img src={book.imageUrl} alt={book.title} className="w-12 h-16 object-cover rounded shadow border" />
                        <div>
                          <h4 className="font-serif font-bold text-sm tracking-tight leading-tight">{book.title}</h4>
                          <span className="text-[10px] text-stone-400 font-bold">Ages {book.ageRange}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <button
                          onClick={() => handleAddToCartFromWishlist(book)}
                          className="flex-1 bg-brand-green text-white text-xs py-2 rounded-xl font-bold shadow cursor-pointer text-center"
                        >
                          Add Hardcover
                        </button>
                        <button
                          onClick={() => handleToggleWishlist(book.id)}
                          className="border px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer text-rose-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* PAGE 12: ADMIN INTERFACE DASHBOARD */}
        {currentPage === "admin" && (
          <AdminDashboard darkMode={darkMode} onRefreshBooks={() => loadData()} />
        )}

        {/* PAGE 13: LEGAL POLICIES */}
        {["privacy", "terms", "shipping", "returns"].includes(currentPage) && (
          <div className="py-16 max-w-3xl mx-auto px-4 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-brand-green capitalize tracking-tight">{currentPage} Policy</h2>
            <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed space-y-4">
              <p>
                Welcome to The AnayaSeries Publishing Platform. This policy represents our binding, standard operating values to ensure secure physical delivery of hand-drawn scriptural hardcovers and reliable, instant digital downloads receipt logs.
              </p>
              <h4 className="font-serif text-base font-bold text-brand-green pt-2">1. Operating Foundations</h4>
              <p>
                We do not track, bundle, or compile user telemetry outside standard email newsletter registrations and secure PayPal sandbox checkout validations. All digital downloads PDFs are gated securely behind checkout email allocation histories.
              </p>
              <h4 className="font-serif text-base font-bold text-brand-green pt-2">2. Secure Transactions</h4>
              <p>
                PayPal acts as our primary transaction gateway. Sandbox simulation represents real backend transactional processes, creating genuine account profiles, granting digital library access, and sending dispatch alerts safely.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <Footer setCurrentPage={setCurrentPage} darkMode={darkMode} />

      {/* TOGGLEABLE INTERACTIVE AI CHATBOT ASSISTANT */}
      <AIChatbot darkMode={darkMode} onBookClick={(bookId) => {
        const book = books.find(b => b.id === bookId);
        if (book) setSelectedBook(book);
      }} />

      {/* BOOK DETAIL DIALOG CONTAINER */}
      {selectedBook && (
        <BookDetailModal
          darkMode={darkMode}
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          cart={cart}
          setCart={setCart}
          wishlist={wishlist}
          toggleWishlist={handleToggleWishlist}
          setCurrentPage={setCurrentPage}
        />
      )}

    </div>
  );
}
