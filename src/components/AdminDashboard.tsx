/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, Sparkles, TrendingUp, ShoppingBag, Download, Mail, BookOpen, Plus, Trash2, Edit2, Check, Clock, Truck, ShieldAlert, FileText, PlusCircle, LogOut } from "lucide-react";
import { Book, Order, BlogPost, PrintableResource, GatedDownload, NewsletterSubscriber } from "../types.js";

interface AdminDashboardProps {
  darkMode: boolean;
  onRefreshBooks: () => void;
}

export default function AdminDashboard({ darkMode, onRefreshBooks }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [authError, setAuthError] = React.useState("");
  
  const [activeTab, setActiveTab] = React.useState<"overview" | "books" | "orders" | "blogs" | "resources" | "newsletter">("overview");

  // DB States
  const [books, setBooks] = React.useState<Book[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [blogs, setBlogs] = React.useState<BlogPost[]>([]);
  const [resources, setResources] = React.useState<PrintableResource[]>([]);
  const [subscribers, setSubscribers] = React.useState<NewsletterSubscriber[]>([]);
  const [downloads, setDownloads] = React.useState<GatedDownload[]>([]);

  // Form States - Book Creation
  const [bookTitle, setBookTitle] = React.useState("");
  const [bookSubtitle, setBookSubtitle] = React.useState("");
  const [bookAuthor, setBookAuthor] = React.useState("Joanna Anaya");
  const [bookIllustrator, setBookIllustrator] = React.useState("Eleanor Finch");
  const [bookIsbn, setBookIsbn] = React.useState("");
  const [bookDescription, setBookDescription] = React.useState("");
  const [bookPricePhysical, setBookPricePhysical] = React.useState(12.99);
  const [bookPriceDigital, setBookPriceDigital] = React.useState(4.99);
  const [bookAgeRange, setBookAgeRange] = React.useState("3-5");
  const [bookCategories, setBookCategories] = React.useState("Prayer, Faith");
  const [bookBibleVerse, setBookBibleVerse] = React.useState("");
  const [bookMoralLesson, setBookMoralLesson] = React.useState("");
  const [bookThemes, setBookThemes] = React.useState("Faith, Courage");
  const [bookPageCount, setBookPageCount] = React.useState(24);
  const [bookReadingTime, setBookReadingTime] = React.useState("8 mins");
  const [bookStock, setBookStock] = React.useState(50);
  const [bookIsFeatured, setBookIsFeatured] = React.useState(false);
  const [bookImageUrl, setBookImageUrl] = React.useState("https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400");
  const [editingBookId, setEditingBookId] = React.useState<string | null>(null);

  // Form States - Blog Creation
  const [blogTitle, setBlogTitle] = React.useState("");
  const [blogSubtitle, setBlogSubtitle] = React.useState("");
  const [blogContent, setBlogContent] = React.useState("");
  const [blogAuthorState, setBlogAuthorState] = React.useState("Joanna Anaya");
  const [blogCategory, setBlogCategory] = React.useState("Parenting");
  const [blogImageUrl, setBlogImageUrl] = React.useState("https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400");

  // Form States - Resource Creation
  const [resTitle, setResTitle] = React.useState("");
  const [resDescription, setResDescription] = React.useState("");
  const [resAge, setResAge] = React.useState("3-5");
  const [resGated, setResGated] = React.useState(true);
  const [resImageUrl, setResImageUrl] = React.useState("https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400");

  // Newsletter blast
  const [nlSubject, setNlSubject] = React.useState("");
  const [nlBody, setNlBody] = React.useState("");
  const [nlStatus, setNlStatus] = React.useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "anaya123" || password === "admin") {
      setIsAuthenticated(true);
      setAuthError("");
      loadAllAdminData();
    } else {
      setAuthError("Incorrect passkey. Please enter 'anaya123' to authenticate.");
    }
  };

  const loadAllAdminData = async () => {
    try {
      const [booksRes, ordersRes, blogsRes, resourcesRes, subsRes, dlsRes] = await Promise.all([
        fetch("/api/books").then(r => r.json()),
        fetch("/api/orders").then(r => r.json()),
        fetch("/api/blogs").then(r => r.json()),
        fetch("/api/resources").then(r => r.json()),
        fetch("/api/admin/subscribers").then(r => r.json()),
        fetch("/api/admin/downloads").then(r => r.json())
      ]);

      setBooks(booksRes);
      setOrders(ordersRes);
      setBlogs(blogsRes);
      setResources(resourcesRes);
      setSubscribers(subsRes);
      setDownloads(dlsRes);
    } catch (err) {
      console.error("Error loading admin data", err);
    }
  };

  // BOOK ACTIONS
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const bookPayload = {
      title: bookTitle,
      subtitle: bookSubtitle,
      author: bookAuthor,
      illustrator: bookIllustrator,
      isbn: bookIsbn || "ISBN-MOCK-" + Math.floor(Math.random() * 100000),
      description: bookDescription,
      pricePhysical: Number(bookPricePhysical),
      priceDigital: Number(bookPriceDigital),
      imageUrl: bookImageUrl,
      pdfUrl: `/downloads/${bookTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      ageRange: bookAgeRange,
      categories: bookCategories.split(",").map(c => c.trim()),
      bibleVerse: bookBibleVerse,
      moralLesson: bookMoralLesson,
      themes: bookThemes.split(",").map(t => t.trim()),
      readingTime: bookReadingTime,
      pageCount: Number(bookPageCount),
      isFeatured: bookIsFeatured,
      stock: Number(bookStock),
      status: "published" as const,
      seoTitle: `${bookTitle} | AnayaSeries Stories`,
      seoDescription: bookSubtitle,
      seoKeywords: bookTitle.toLowerCase().split(/\s+/),
      gallery: []
    };

    try {
      let response;
      if (editingBookId) {
        response = await fetch(`/api/books/${editingBookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookPayload)
        });
      } else {
        response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bookTitle.toLowerCase().replace(/\s+/g, "-"), ...bookPayload })
        });
      }

      if (response.ok) {
        loadAllAdminData();
        onRefreshBooks();
        resetBookForm();
      }
    } catch (err) {
      console.error("Error saving book", err);
    }
  };

  const resetBookForm = () => {
    setBookTitle("");
    setBookSubtitle("");
    setBookIsbn("");
    setBookDescription("");
    setBookPricePhysical(12.99);
    setBookPriceDigital(4.99);
    setBookBibleVerse("");
    setBookMoralLesson("");
    setBookPageCount(24);
    setBookReadingTime("8 mins");
    setBookStock(50);
    setBookIsFeatured(false);
    setEditingBookId(null);
  };

  const handleEditBook = (b: Book) => {
    setEditingBookId(b.id);
    setBookTitle(b.title);
    setBookSubtitle(b.subtitle);
    setBookAuthor(b.author);
    setBookIllustrator(b.illustrator);
    setBookIsbn(b.isbn);
    setBookDescription(b.description);
    setBookPricePhysical(b.pricePhysical);
    setBookPriceDigital(b.priceDigital);
    setBookAgeRange(b.ageRange);
    setBookCategories(b.categories.join(", "));
    setBookBibleVerse(b.bibleVerse);
    setBookMoralLesson(b.moralLesson);
    setBookThemes(b.themes.join(", "));
    setBookPageCount(b.pageCount);
    setBookReadingTime(b.readingTime);
    setBookStock(b.stock);
    setBookIsFeatured(b.isFeatured);
    setBookImageUrl(b.imageUrl);
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book from the active catalog?")) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadAllAdminData();
        onRefreshBooks();
      }
    } catch (err) {
      console.error("Delete book error", err);
    }
  };

  // ORDER UPDATE STATUS
  const handleUpdateOrderStatus = async (id: string, status: "pending" | "shipped" | "delivered" | "canceled") => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch (err) {
      console.error("Error updating order", err);
    }
  };

  // BLOG CREATION
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: blogTitle.toLowerCase().replace(/\s+/g, "-"),
      title: blogTitle,
      subtitle: blogSubtitle,
      content: blogContent,
      author: blogAuthorState,
      imageUrl: blogImageUrl,
      category: blogCategory,
      status: "published" as const,
      createdAt: new Date().toISOString(),
      readTime: "5 min read"
    };

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setBlogTitle("");
        setBlogSubtitle("");
        setBlogContent("");
        loadAllAdminData();
      }
    } catch (err) {
      console.error("Error saving blog", err);
    }
  };

  // RESOURCE CREATION
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: resTitle.toLowerCase().replace(/\s+/g, "-"),
      title: resTitle,
      description: resDescription,
      imageUrl: resImageUrl,
      downloadUrl: `/downloads/${resTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      downloadCount: 0,
      isGated: resGated,
      ageRange: resAge
    };

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setResTitle("");
        setResDescription("");
        loadAllAdminData();
      }
    } catch (err) {
      console.error("Error saving resource", err);
    }
  };

  // NEWSLETTER SEND BLAST
  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlSubject || !nlBody) return;
    setNlStatus("broadcasting");

    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: nlSubject, content: nlBody })
      });
      if (res.ok) {
        const data = await res.json();
        setNlStatus("success");
        setNlSubject("");
        setNlBody("");
        setTimeout(() => setNlStatus(""), 4000);
      }
    } catch (err) {
      setNlStatus("error");
    }
  };

  // Revenue calc
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "completed")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center py-20 px-4">
        <div className={`w-full max-w-md p-8 rounded-3xl border transition-colors ${
          darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
        } premium-shadow text-center space-y-6`}>
          <div className="w-12 h-12 bg-brand-green/10 text-brand-gold rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-brand-gold" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-brand-green">Admin Gate Login</h2>
            <p className="text-xs text-stone-500">
              Only authorized publishing staff of The AnayaSeries may enter. Use passkey **anaya123** or **admin** to explore controls.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              placeholder="Enter admin credentials"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-gold text-center text-sm"
            />
            {authError && <p className="text-[11px] text-rose-500 font-medium">{authError}</p>}
            
            <button
              type="submit"
              className="w-full bg-brand-green hover:bg-brand-green-light text-brand-cream py-3 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>Unlock Admin Panel</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800/40 pb-6 mb-8">
        <div>
          <h2 className="font-serif text-3xl font-black text-brand-green tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-brand-gold" />
            <span>Publishing Control Panel</span>
          </h2>
          <p className="text-xs text-stone-500">Managing catalog releases, orders, newsletters, and digital gated printables.</p>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700/60 text-stone-500 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </button>
      </div>

      {/* Main navigation blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side Links */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-stone-800/40 lg:pr-6 whitespace-nowrap">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer transition-all ${
              activeTab === "overview" ? "bg-brand-green text-white" : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            📊 Bento Overview
          </button>
          <button
            onClick={() => setActiveTab("books")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer transition-all ${
              activeTab === "books" ? "bg-brand-green text-white" : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            📖 Books Manager
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer relative transition-all ${
              activeTab === "orders" ? "bg-brand-green text-white" : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            📦 Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer transition-all ${
              activeTab === "blogs" ? "bg-brand-green text-white" : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            ✍️ Blog Articles
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer transition-all ${
              activeTab === "resources" ? "bg-brand-green text-white" : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            🎨 Free Crafts
          </button>
          <button
            onClick={() => setActiveTab("newsletter")}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer transition-all ${
              activeTab === "newsletter" ? "bg-brand-green text-white" : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            ✉️ Email blasts
          </button>
        </div>

        {/* Right Side Content body */}
        <div className="lg:col-span-4 space-y-6">
          
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Bento statistical columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
                  <div className="flex justify-between items-center text-stone-400">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Total Sales</span>
                    <TrendingUp className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <p className="font-serif font-black text-2xl text-brand-green mt-2">${totalRevenue.toFixed(2)}</p>
                  <span className="text-[9px] text-stone-400 block mt-1">Direct mock transactions</span>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
                  <div className="flex justify-between items-center text-stone-400">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Orders Logged</span>
                    <ShoppingBag className="w-4 h-4 text-brand-green" />
                  </div>
                  <p className="font-serif font-black text-2xl text-brand-green mt-2">{orders.length}</p>
                  <span className="text-[9px] text-stone-400 block mt-1">Pending and shipped</span>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
                  <div className="flex justify-between items-center text-stone-400">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Gated Emails</span>
                    <Download className="w-4 h-4 text-brand-green" />
                  </div>
                  <p className="font-serif font-black text-2xl text-brand-green mt-2">{downloads.length}</p>
                  <span className="text-[9px] text-stone-400 block mt-1">Printable unlocks</span>
                </div>

                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
                  <div className="flex justify-between items-center text-stone-400">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Newsletter Subs</span>
                    <Mail className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <p className="font-serif font-black text-2xl text-brand-green mt-2">{subscribers.length}</p>
                  <span className="text-[9px] text-stone-400 block mt-1">Active digest list</span>
                </div>

              </div>

              {/* Bento Content columns - Recent gated activity & newsletter subs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Recent Downloads gated activity */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-green border-b pb-3 mb-4">Gated Printable Downloads Activity</h3>
                    {downloads.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No printable download operations tracked yet.</p>
                    ) : (
                      <div className="space-y-3.5 max-h-60 overflow-y-auto">
                        {downloads.slice(-5).reverse().map((dl) => (
                          <div key={dl.id} className="text-xs flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div>
                              <p className="font-semibold">{dl.email}</p>
                              <span className="text-[10px] text-stone-400">Unlocked: {dl.resourceTitle}</span>
                            </div>
                            <span className="text-[9px] font-mono text-stone-400">{new Date(dl.createdAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Newsletter Subscriber Base list */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brand-green border-b pb-3 mb-4">Newsletter Subscribers Database</h3>
                    {subscribers.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No subscribers yet.</p>
                    ) : (
                      <div className="space-y-3.5 max-h-60 overflow-y-auto">
                        {subscribers.slice(-5).reverse().map((sub) => (
                          <div key={sub.id} className="text-xs flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <span className="font-semibold">{sub.email}</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {activeTab === "books" && (
            <div className="space-y-8">
              
              {/* Table of active catalog */}
              <div className={`p-6 rounded-2xl border ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
                <h3 className="font-serif text-lg font-bold text-brand-green border-b pb-3 mb-4">Active Catalog Release Records</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-stone-400">
                        <th className="py-2.5">Book Title</th>
                        <th className="py-2.5">Price</th>
                        <th className="py-2.5">Ages</th>
                        <th className="py-2.5">Stock</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/40">
                      {books.map((b) => (
                        <tr key={b.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/20">
                          <td className="py-3 font-semibold">{b.title}</td>
                          <td className="py-3">${b.pricePhysical} / ${b.priceDigital}</td>
                          <td className="py-3">Ages {b.ageRange}</td>
                          <td className="py-3">{b.stock} left</td>
                          <td className="py-3 text-right flex justify-end gap-2">
                            <button
                              onClick={() => handleEditBook(b)}
                              className="p-1 text-brand-green hover:text-brand-gold cursor-pointer"
                              title="Edit Book"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(b.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="Delete Book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Form creation */}
              <form onSubmit={handleSaveBook} className={`p-6 rounded-2xl border space-y-4 ${
                darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
              } premium-shadow`}>
                <h3 className="font-serif text-xl font-bold text-brand-green border-b pb-3">
                  {editingBookId ? "Edit Catalog Book" : "Release New Catalog Book"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Book Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Anaya's Bedtime Verse"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Subtitle / Tagline</label>
                    <input
                      type="text"
                      required
                      placeholder="Trusting God in the Quiet Dark"
                      value={bookSubtitle}
                      onChange={(e) => setBookSubtitle(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Author</label>
                    <input
                      type="text"
                      required
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Illustrator</label>
                    <input
                      type="text"
                      required
                      value={bookIllustrator}
                      onChange={(e) => setBookIllustrator(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">ISBN</label>
                    <input
                      type="text"
                      placeholder="978-1-234567-00-1"
                      value={bookIsbn}
                      onChange={(e) => setBookIsbn(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Age Suitability Range</label>
                    <select
                      value={bookAgeRange}
                      onChange={(e) => setBookAgeRange(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    >
                      <option value="0-2">Ages 0-2 (Toddlers)</option>
                      <option value="3-5">Ages 3-5 (Early Years)</option>
                      <option value="6-8">Ages 6-8 (Young Reader)</option>
                      <option value="9-11">Ages 9-11 (Pre-teens)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Hardcover Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={bookPricePhysical}
                      onChange={(e) => setBookPricePhysical(Number(e.target.value))}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Digital PDF Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={bookPriceDigital}
                      onChange={(e) => setBookPriceDigital(Number(e.target.value))}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Bible Scripture Reference</label>
                    <input
                      type="text"
                      required
                      placeholder="Proverbs 3:5"
                      value={bookBibleVerse}
                      onChange={(e) => setBookBibleVerse(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">The Moral Virtues Lesson</label>
                    <input
                      type="text"
                      required
                      placeholder="Trusting God protects us from fear..."
                      value={bookMoralLesson}
                      onChange={(e) => setBookMoralLesson(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Categories (separated by comma)</label>
                    <input
                      type="text"
                      value={bookCategories}
                      onChange={(e) => setBookCategories(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Themes (separated by comma)</label>
                    <input
                      type="text"
                      value={bookThemes}
                      onChange={(e) => setBookThemes(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Page Count</label>
                    <input
                      type="number"
                      required
                      value={bookPageCount}
                      onChange={(e) => setBookPageCount(Number(e.target.value))}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Est. Reading time</label>
                    <input
                      type="text"
                      required
                      value={bookReadingTime}
                      onChange={(e) => setBookReadingTime(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Initial Stock</label>
                    <input
                      type="number"
                      required
                      value={bookStock}
                      onChange={(e) => setBookStock(Number(e.target.value))}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1 flex items-center pt-5">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={bookIsFeatured}
                      onChange={(e) => setBookIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-green border-stone-300 mr-2"
                    />
                    <label htmlFor="isFeatured" className="font-semibold text-stone-500 cursor-pointer select-none">
                      Mark as Featured Homepage Slider
                    </label>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="font-semibold text-stone-400">Description Summary</label>
                    <textarea
                      required
                      rows={3}
                      value={bookDescription}
                      onChange={(e) => setBookDescription(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="font-semibold text-stone-400">Cover Mockup Image Url</label>
                    <input
                      type="text"
                      value={bookImageUrl}
                      onChange={(e) => setBookImageUrl(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {editingBookId && (
                    <button
                      type="button"
                      onClick={resetBookForm}
                      className="border py-2.5 px-6 rounded-xl text-xs font-semibold hover:bg-stone-50"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    {editingBookId ? "Update Release" : "Publish Book Release"}
                  </button>
                </div>
              </form>

            </div>
          )}

          {activeTab === "orders" && (
            <div className={`p-6 rounded-2xl border ${darkMode ? "bg-stone-900/30 border-stone-800" : "bg-white border-stone-200"} premium-shadow`}>
              <h3 className="font-serif text-lg font-bold text-brand-green border-b pb-3 mb-4">Customer Orders & Shipment Controls</h3>
              {orders.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No customer orders recorded in the sandbox.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b text-stone-400">
                        <th className="py-2.5">Order ID</th>
                        <th className="py-2.5">Customer</th>
                        <th className="py-2.5">Items Purchased</th>
                        <th className="py-2.5">Total Amount</th>
                        <th className="py-2.5">Status</th>
                        <th className="py-2.5 text-right">Update Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/40">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/20">
                          <td className="py-3 font-mono font-bold text-brand-green">{o.id}</td>
                          <td className="py-3">
                            <p className="font-semibold">{o.customerName}</p>
                            <span className="text-[10px] text-stone-400">{o.customerEmail}</span>
                          </td>
                          <td className="py-3 max-w-xs truncate">
                            {o.items.map((it) => `${it.title} (${it.format})`).join(", ")}
                          </td>
                          <td className="py-3 font-bold font-mono">${o.totalAmount}</td>
                          <td className="py-3">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              o.status === "delivered" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : o.status === "shipped" 
                                  ? "bg-sky-100 text-sky-800" 
                                  : "bg-amber-100 text-amber-800"
                            }`}>
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {o.type !== "digital" && o.status !== "delivered" && (
                              <div className="flex justify-end gap-1">
                                {o.status === "pending" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.id, "shipped")}
                                    className="bg-sky-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer hover:bg-sky-600 transition-colors"
                                  >
                                    Mark Shipped
                                  </button>
                                )}
                                {o.status === "shipped" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.id, "delivered")}
                                    className="bg-emerald-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer hover:bg-emerald-600 transition-colors"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                              </div>
                            )}
                            {o.type === "digital" && (
                              <span className="text-[10px] text-stone-400 italic">Instant Auto-Delivered</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "blogs" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveBlog} className={`p-6 rounded-2xl border space-y-4 ${
                darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
              } premium-shadow`}>
                <h3 className="font-serif text-xl font-bold text-brand-green border-b pb-3">Write New Faith Magazine Article</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Article Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Fostering Kindness on the Playground"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Brief Subtitle Summary</label>
                    <input
                      type="text"
                      required
                      placeholder="How simple stories help kids share sandbox toys..."
                      value={blogSubtitle}
                      onChange={(e) => setBlogSubtitle(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Author</label>
                    <input
                      type="text"
                      value={blogAuthorState}
                      onChange={(e) => setBlogAuthorState(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Category Tag</label>
                    <input
                      type="text"
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="font-semibold text-stone-400">Article Content markdown text</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Use headers (# Heading) and bullets to write content..."
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Publish Article
                </button>
              </form>
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveResource} className={`p-6 rounded-2xl border space-y-4 ${
                darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
              } premium-shadow`}>
                <h3 className="font-serif text-xl font-bold text-brand-green border-b pb-3">Upload Gated Printable Activity Material</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Resource Title</label>
                    <input
                      type="text"
                      required
                      placeholder="Daniel in the Lions' Den Crossword"
                      value={resTitle}
                      onChange={(e) => setResTitle(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Age Range</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 6-8"
                      value={resAge}
                      onChange={(e) => setResAge(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="font-semibold text-stone-400">Description</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Short description highlighting biblical craft values taught..."
                      value={resDescription}
                      onChange={(e) => setResDescription(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 bg-transparent"
                    />
                  </div>

                  <div className="space-y-1 flex items-center pt-4">
                    <input
                      type="checkbox"
                      id="resGated"
                      checked={resGated}
                      onChange={(e) => setResGated(e.target.checked)}
                      className="w-4 h-4 text-brand-green border-stone-300 rounded mr-2"
                    />
                    <label htmlFor="resGated" className="font-semibold text-stone-500 select-none cursor-pointer">
                      Require Gated Parent Email Signup
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Publish Printable Resource
                </button>
              </form>
            </div>
          )}

          {activeTab === "newsletter" && (
            <div className="space-y-6">
              <form onSubmit={handleSendNewsletter} className={`p-6 rounded-2xl border space-y-4 ${
                darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
              } premium-shadow`}>
                
                <div className="border-b pb-3">
                  <h3 className="font-serif text-xl font-bold text-brand-green">Broadcast Family Email Blast</h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    This triggers simulated Resend notifications, dispatching stories to the active **{subscribers.length}** families.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Newsletter Subject Line</label>
                    <input
                      type="text"
                      required
                      placeholder="🕊️ Monthly Devotional: Raising Cheerful Givers in a Greedy World"
                      value={nlSubject}
                      onChange={(e) => setNlSubject(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2.5 bg-transparent focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-400">Email Contents (Markdown or text)</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Hello Anaya Family! Today we explore some beautiful coloring crafts..."
                      value={nlBody}
                      onChange={(e) => setNlBody(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2.5 bg-transparent focus:ring-1 focus:ring-brand-gold"
                    />
                  </div>
                </div>

                {nlStatus === "broadcasting" && (
                  <p className="text-xs text-brand-gold animate-pulse">📡 Broadcasting newsletter blast to subscribers...</p>
                )}
                {nlStatus === "success" && (
                  <p className="text-xs text-emerald-600 font-bold">🕊️ Broadcast simulation success! SMTP packets sent to {subscribers.length} active families.</p>
                )}

                <button
                  type="submit"
                  disabled={nlStatus === "broadcasting" || subscribers.length === 0}
                  className="bg-brand-green hover:bg-brand-green-light text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  Send Newsletter Blast
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
