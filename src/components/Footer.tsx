/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Mail, ArrowRight, Heart } from "lucide-react";

const logoUrl = "/src/assets/images/anaya_logo_1782922867215.jpg";

interface FooterProps {
  setCurrentPage: (page: string) => void;
  darkMode: boolean;
}

export default function Footer({ setCurrentPage, darkMode }: FooterProps) {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch (err) {
      console.error("Newsletter error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className={`transition-colors border-t ${
      darkMode 
        ? "bg-[#1E1D1C] border-[#3C3A39] text-stone-300" 
        : "bg-brand-green border-brand-green-dark text-stone-100"
    } pt-16 pb-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage("home")}>
              <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-brand-gold/20 flex items-center justify-center p-0.5">
                <img 
                  src={logoUrl} 
                  alt="AnayaSeries Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                AnayaSeries
              </span>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed max-w-xs">
              Sowing seeds of scripture, wisdom, and beautiful morals into the hearts of little ones through inspired storytelling and creative printables.
            </p>
            <div className="flex space-x-4 pt-2">
              <span className="text-xs text-brand-gold font-medium bg-brand-green-dark/40 px-3 py-1.5 rounded-full border border-brand-gold/10">
                Ages 0 to 11 Years
              </span>
              <span className="text-xs text-brand-gold font-medium bg-brand-green-dark/40 px-3 py-1.5 rounded-full border border-brand-gold/10">
                Christian Family Centered
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-6 border-b border-brand-gold/20 pb-2">
              Explore Stories
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button onClick={() => setCurrentPage("store")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full">
                  Children's Shop
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("resources")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full">
                  Free Colorings & Printables
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("blog")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full">
                  Parenting & Faith Blog
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("schools")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full">
                  Sunday School & Churches
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("parents")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full">
                  Parents Reading Tracker
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Help */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-6 border-b border-brand-gold/20 pb-2">
              Support & Policies
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button onClick={() => setCurrentPage("faq")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("privacy")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full text-stone-300">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("terms")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full text-stone-300">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("shipping")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full text-stone-300">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage("returns")} className="hover:text-brand-gold transition-colors cursor-pointer text-left w-full text-stone-300">
                  Returns & Refunds
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4 border-b border-brand-gold/20 pb-2">
              Join the Family
            </h4>
            <p className="text-sm text-stone-300 mb-4">
              Subscribe to get free mini-guides, coloring alerts, and first-access to physical book pre-orders.
            </p>

            {subscribed ? (
              <div className="bg-brand-cream/10 border border-brand-gold/20 rounded-xl p-4 text-center">
                <p className="text-brand-gold text-sm font-semibold mb-1">🕊️ Welcome to the Family!</p>
                <p className="text-xs text-stone-300">We've added your email to our faith digest list.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3.5">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="h-4 w-4 text-stone-400" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter parent or church email"
                    className="w-full pl-10 pr-4 py-3 bg-brand-cream/10 border border-stone-500/30 rounded-xl text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-green-dark font-semibold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? "Registering..." : "Subscribe Gated Free"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="mt-16 pt-8 border-t border-brand-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} The AnayaSeries Publishing House. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Formed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> in a God-honoring Christian family.
          </p>
        </div>
      </div>
    </footer>
  );
}
