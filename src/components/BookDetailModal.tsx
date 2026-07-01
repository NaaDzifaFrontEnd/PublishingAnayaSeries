/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Heart, ShoppingBag, BookOpen, Star, HelpCircle, AlertCircle, MessageSquare, Sparkles, Loader } from "lucide-react";
import { Book, CartItem, Review } from "../types.js";

interface BookDetailModalProps {
  darkMode: boolean;
  book: Book;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  wishlist: string[];
  toggleWishlist: (bookId: string) => void;
  setCurrentPage: (page: string) => void;
}

export default function BookDetailModal({
  darkMode,
  book,
  onClose,
  cart,
  setCart,
  wishlist,
  toggleWishlist,
  setCurrentPage
}: BookDetailModalProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = React.useState(true);
  
  // Review Form States
  const [reviewName, setReviewName] = React.useState("");
  const [reviewRating, setReviewRating] = React.useState(5);
  const [reviewComment, setReviewComment] = React.useState("");
  const [submittingReview, setSubmittingReview] = React.useState(false);

  // AI Assistant States
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<any | null>(null);
  const [targetAge, setTargetAge] = React.useState(book.ageRange);

  React.useEffect(() => {
    // Load reviews
    setLoadingReviews(true);
    fetch(`/api/reviews/${book.id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);
        setLoadingReviews(false);
      })
      .catch((err) => {
        console.error("Error loading reviews", err);
        setLoadingReviews(false);
      });
  }, [book.id]);

  const handleAddToCart = (format: "physical" | "digital") => {
    setCart((prev) => {
      const exists = prev.find((item) => item.bookId === book.id && item.format === format);
      if (exists) {
        return prev.map((item) =>
          item.bookId === book.id && item.format === format
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { bookId: book.id, book, quantity: 1, format }];
    });
    setCurrentPage("cart");
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    setSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          userName: reviewName,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews((prev) => [newReview, ...prev]);
        setReviewName("");
        setReviewComment("");
      }
    } catch (err) {
      console.error("Error adding review", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAskAI = async () => {
    if (aiLoading) return;
    setAiLoading(true);

    try {
      const response = await fetch("/api/ai/reading-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textSnippet: book.description,
          targetAge: targetAge
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiResult(data);
      }
    } catch (err) {
      console.error("AI Reader error", err);
    } finally {
      setAiLoading(false);
    }
  };

  const isWishlisted = wishlist.includes(book.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex justify-center p-4 sm:p-6 md:p-10">
      <div className={`w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border transition-colors ${
        darkMode ? "bg-brand-charcoal border-[#3C3A39] text-brand-cream" : "bg-brand-cream border-stone-200 text-brand-charcoal"
      }`}>
        
        {/* Left Side: Dynamic Cover representation & Purchase block */}
        <div className={`w-full md:w-2/5 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r ${
          darkMode ? "border-[#3C3A39] bg-stone-900/30" : "border-stone-200 bg-stone-50/50"
        }`}>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                onClick={() => toggleWishlist(book.id)}
                className={`p-2.5 rounded-full shadow border transition-all cursor-pointer ${
                  isWishlisted 
                    ? "bg-rose-50 border-rose-200 text-rose-500" 
                    : "bg-white border-stone-200 text-stone-400 hover:text-rose-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            {/* Book Cover */}
            <div className="aspect-[3/4] w-64 max-w-full mx-auto relative rounded-2xl overflow-hidden border premium-shadow bg-white">
              <img
                src={book.imageUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-brand-green text-white text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-brand-gold/15 uppercase tracking-widest">
                Ages {book.ageRange}
              </span>
            </div>

            {/* Author illustration tagline */}
            <div className="text-center">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-widest">Illustrations by {book.illustrator}</p>
              <p className="text-[11px] text-stone-400 mt-1 font-mono">ISBN: {book.isbn}</p>
            </div>
          </div>

          {/* Pricing cards & Purchase Triggers */}
          <div className="space-y-4 pt-6 md:pt-0">
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Physical block */}
              <button
                onClick={() => handleAddToCart("physical")}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all hover:border-brand-gold cursor-pointer ${
                  darkMode ? "bg-stone-800/40 border-stone-700" : "bg-white border-stone-200"
                } premium-shadow-hover`}
              >
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Physical Hardcover</span>
                  <p className="font-serif font-bold text-lg text-brand-green mt-1">${book.pricePhysical}</p>
                </div>
                <div className="flex items-center space-x-1 text-[11px] font-semibold text-brand-gold mt-4">
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Ship to Address</span>
                </div>
              </button>

              {/* Digital block */}
              <button
                onClick={() => handleAddToCart("digital")}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all hover:border-brand-gold cursor-pointer ${
                  darkMode ? "bg-stone-800/40 border-stone-700" : "bg-white border-stone-200"
                } premium-shadow-hover`}
              >
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Digital PDF Guide</span>
                  <p className="font-serif font-bold text-lg text-brand-green mt-1">${book.priceDigital}</p>
                </div>
                <div className="flex items-center space-x-1 text-[11px] font-semibold text-brand-gold mt-4">
                  <BookOpen className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Instant Download</span>
                </div>
              </button>

            </div>
          </div>
        </div>

        {/* Right Side: Scrollable detailed metrics & AI generator */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8 max-h-[80vh] md:max-h-none">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-brand-green tracking-tight leading-tight">{book.title}</h2>
            <p className="font-serif text-lg text-[#8C867A] italic mt-1">{book.subtitle}</p>
            <p className="text-xs text-brand-gold font-bold uppercase tracking-widest mt-2">By {book.author}</p>
          </div>

          {/* Scripture & Moral Frame */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Verse */}
            <div className={`p-4 rounded-2xl border transition-colors ${
              darkMode ? "bg-[#252423] border-[#3C3A39]" : "bg-[#F7F3E9] border-brand-cream-dark"
            } border-l-4 border-l-brand-gold`}>
              <span className="text-[9px] uppercase font-bold text-[#8C867A] tracking-wider block mb-1">FOUNDATIONAL SCRIPTURE</span>
              <p className="text-xs italic leading-relaxed text-stone-700 dark:text-stone-300 font-serif">
                {book.bibleVerse}
              </p>
            </div>

            {/* Moral lesson */}
            <div className={`p-4 rounded-2xl border transition-colors ${
              darkMode ? "bg-[#252423] border-[#3C3A39]" : "bg-[#F7F3E9] border-brand-cream-dark"
            } border-l-4 border-l-brand-green`}>
              <span className="text-[9px] uppercase font-bold text-[#8C867A] tracking-wider block mb-1">THE CENTRAL VALUE TOLD</span>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                {book.moralLesson}
              </p>
            </div>

          </div>

          {/* Book details list */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Book Information</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-stone-50 dark:bg-stone-900/20 border p-3 rounded-xl">
                <span className="text-stone-400 font-medium">Page Count</span>
                <p className="font-bold text-sm text-brand-green mt-0.5">{book.pageCount} Pages</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-900/20 border p-3 rounded-xl">
                <span className="text-stone-400 font-medium">Reading Time</span>
                <p className="font-bold text-sm text-brand-green mt-0.5">{book.readingTime}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-900/20 border p-3 rounded-xl">
                <span className="text-stone-400 font-medium">Age Suitability</span>
                <p className="font-bold text-sm text-brand-green mt-0.5">Ages {book.ageRange}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-900/20 border p-3 rounded-xl">
                <span className="text-stone-400 font-medium">Categories</span>
                <p className="font-bold text-sm text-brand-green mt-0.5 truncate">{book.categories[0] || "Children's"}</p>
              </div>
            </div>
          </div>

          {/* Detailed description */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">The Story Summary</h4>
            <p className={`text-sm leading-relaxed ${darkMode ? "text-stone-300" : "text-stone-600"}`}>
              {book.description}
            </p>
          </div>

          {/* DYNAMIC AI COMPANION CONTAINER */}
          <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/5 p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                <h3 className="font-serif font-bold text-lg text-brand-green flex items-center gap-1.5">
                  AI Parent-Child Reading Companion
                  <span className="text-[8px] bg-brand-gold text-brand-green-dark px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-widest">Active</span>
                </h3>
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-stone-400 font-medium">Target Child Age:</span>
                <select
                  value={targetAge}
                  onChange={(e) => setTargetAge(e.target.value)}
                  className="border rounded px-2 py-1 focus:ring-1 focus:ring-brand-gold bg-transparent text-xs"
                >
                  <option value="0-2">Ages 0-2</option>
                  <option value="3-5">Ages 3-5</option>
                  <option value="6-8">Ages 6-8</option>
                  <option value="9-11">Ages 9-11</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Generate a custom, age-appropriate parenting worksheet with story themes, Scripture reflections, and specific bedtime conversation-starter questions for this child.
            </p>

            {aiLoading ? (
              <div className="flex justify-center py-4 space-x-2 text-xs italic text-stone-400">
                <Loader className="w-4 h-4 animate-spin text-brand-gold" />
                <span>Assembling parenting scripture workbook...</span>
              </div>
            ) : aiResult ? (
              <div className={`p-4 rounded-xl border space-y-4 text-xs transition-colors ${
                darkMode ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200"
              }`}>
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-stone-100 dark:border-stone-800/40">
                  <div>
                    <span className="text-stone-400 block font-bold uppercase text-[9px]">LITERACY SCORE GRADE</span>
                    <span className="text-brand-green font-semibold">{aiResult.readingLevelGrade}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-bold uppercase text-[9px]">GODLY LESSON THEME</span>
                    <span className="text-brand-green font-semibold">{aiResult.moralLessonFound}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-brand-gold font-bold uppercase text-[9px]">SCRIPTURE COUPLING VERSE</span>
                  <p className="italic font-serif leading-relaxed text-stone-600 dark:text-stone-300">
                    "{aiResult.suggestedBibleVerse || "Genesis 1:1"}"
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-stone-400 block font-bold uppercase text-[9px] tracking-wider">BEDTIME DISCUSSION STARTERS (PARENTS)</span>
                  <ul className="space-y-1.5 list-disc pl-4 text-stone-600 dark:text-stone-300 leading-relaxed">
                    {aiResult.parentDiscussionPrompts?.map((q: string, qIdx: number) => (
                      <li key={qIdx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAskAI}
                className="bg-brand-green hover:bg-brand-green-light text-brand-cream px-5 py-2.5 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer border border-brand-gold/15"
              >
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <span>Ask AI Reading Assistant</span>
              </button>
            )}
          </div>

          {/* Reviews section */}
          <div className="space-y-6 pt-6 border-t border-stone-200 dark:border-stone-800/40">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Reader Reviews</h4>

            {loadingReviews ? (
              <div className="animate-pulse space-y-2 text-center text-xs text-stone-400">
                <Loader className="w-4 h-4 animate-spin text-brand-gold mx-auto" />
                <span>Opening reviews archive...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {reviews.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No reviews yet. Be the first to share your family's testimony!</p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                        darkMode ? "bg-[#252423] border-[#3C3A39]" : "bg-white border-stone-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-brand-green">{rev.userName}</span>
                        <div className="flex text-brand-gold">
                          {Array.from({ length: rev.rating }).map((_, rIdx) => (
                            <Star key={rIdx} className="w-3 h-3 fill-brand-gold" />
                          ))}
                        </div>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed">"{rev.comment}"</p>
                      <span className="text-[9px] text-stone-400 block text-right">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} className="space-y-3 pt-4 border-t border-dashed">
              <p className="text-[10px] font-bold text-[#8C867A] uppercase tracking-wider">Leave a Review</p>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Your Name (Parent or Church)"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-gold bg-transparent"
                />
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-stone-400">Rating:</span>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="border rounded px-2 py-1 focus:ring-1 focus:ring-brand-gold bg-transparent"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                    <option value={3}>⭐⭐⭐ (3/5)</option>
                  </select>
                </div>
              </div>

              <textarea
                required
                rows={2}
                placeholder="Share how this story helped your family's faith formation lessons..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-brand-gold bg-transparent"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="bg-brand-green hover:bg-brand-green-light text-white text-xs px-4 py-2 rounded-xl cursor-pointer font-bold shadow"
              >
                {submittingReview ? "Posting Testimony..." : "Post Review Testimony"}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
