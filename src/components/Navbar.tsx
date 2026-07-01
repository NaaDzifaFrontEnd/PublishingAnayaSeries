/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Heart, ShoppingBag, User, Shield, Menu, X, HelpCircle, Sun, Moon } from "lucide-react";
import { Book, CartItem } from "../types.js";

const logoUrl = "/src/assets/images/anaya_logo_1782922867215.jpg";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  cart: CartItem[];
  wishlist: string[];
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
}

export default function Navbar({
  currentPage,
  setCurrentPage,
  cart,
  wishlist,
  isAdmin,
  setIsAdmin,
  darkMode,
  setDarkMode,
  userEmail,
  setUserEmail
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "store", label: "Books" },
    { id: "resources", label: "Free Resources" },
    { id: "blog", label: "Faith Blog" },
    { id: "schools", label: "Churches & Schools" },
    { id: "parents", label: "Parents Corner" },
    { id: "faq", label: "FAQs" }
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors border-b ${
      darkMode 
        ? "bg-brand-charcoal border-[#3C3A39] text-brand-cream" 
        : "bg-brand-cream border-brand-cream-dark text-brand-charcoal"
    } premium-shadow`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div 
            onClick={() => { setCurrentPage("home"); setMobileMenuOpen(false); }} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-lg bg-white overflow-hidden border border-brand-cream-dark flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
              <img 
                src={logoUrl} 
                alt="The AnayaSeries Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brand-green group-hover:text-brand-gold transition-colors block">
                The AnayaSeries
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8C867A] block font-medium -mt-1">
                God Answers
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentPage(link.id)}
                className={`text-sm font-medium transition-colors cursor-pointer relative py-1 ${
                  currentPage === link.id
                    ? "text-brand-green font-semibold"
                    : "text-stone-500 hover:text-brand-green"
                }`}
              >
                {link.label}
                {currentPage === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="hidden sm:flex items-center space-x-6">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-500 hover:text-brand-gold"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-brand-gold" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Admin Switcher */}
            <button
              onClick={() => {
                if (isAdmin) {
                  setIsAdmin(false);
                  setCurrentPage("home");
                } else {
                  setCurrentPage("admin");
                }
              }}
              className={`p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative cursor-pointer ${
                isAdmin ? "text-brand-gold font-bold" : "text-stone-500"
              }`}
              title={isAdmin ? "Exit Admin Panel" : "Go to Admin Panel"}
            >
              <Shield className="w-5 h-5" />
              {isAdmin && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-gold rounded-full" />}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setCurrentPage("wishlist")}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative cursor-pointer text-stone-500 hover:text-rose-500"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account Dashboard */}
            <button
              onClick={() => setCurrentPage("account")}
              className={`p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                currentPage === "account" ? "text-brand-green" : "text-stone-500 hover:text-brand-green"
              }`}
              title="My Account & Downloads"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCurrentPage("cart")}
              className="flex items-center space-x-2 bg-brand-green text-brand-cream px-4 py-2.5 rounded-full hover:bg-brand-green-light transition-all cursor-pointer font-medium premium-shadow"
            >
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              <span className="text-sm">Cart</span>
              {totalCartItems > 0 && (
                <span className="bg-brand-gold text-brand-charcoal text-xs px-2 py-0.5 rounded-full font-bold ml-1">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Icons */}
          <div className="flex lg:hidden items-center space-x-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded-full text-stone-500 hover:text-brand-gold">
              {darkMode ? <Sun className="w-5 h-5 text-brand-gold" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setCurrentPage("cart")} className="relative p-2 text-stone-500">
              <ShoppingBag className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-brand-green text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-stone-100 text-stone-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t px-4 pt-4 pb-6 space-y-3 transition-all ${
          darkMode ? "bg-brand-charcoal border-[#3C3A39]" : "bg-brand-cream border-brand-cream-dark"
        }`}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentPage(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
                currentPage === link.id
                  ? "bg-brand-green text-white"
                  : "text-stone-600 hover:bg-stone-100 hover:text-brand-green"
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="border-t border-brand-cream-dark pt-3 mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setCurrentPage("account");
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center space-x-2 py-2 border rounded-lg text-sm font-medium border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              <User className="w-4 h-4 text-stone-500" />
              <span>My Account</span>
            </button>
            <button
              onClick={() => {
                setCurrentPage("wishlist");
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center space-x-2 py-2 border rounded-lg text-sm font-medium border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Wishlist ({wishlist.length})</span>
            </button>
            <button
              onClick={() => {
                setIsAdmin(!isAdmin);
                setCurrentPage(isAdmin ? "home" : "admin");
                setMobileMenuOpen(false);
              }}
              className="col-span-2 flex items-center justify-center space-x-2 py-2.5 bg-brand-green/10 text-brand-green hover:bg-brand-green/20 rounded-lg text-sm font-medium"
            >
              <Shield className="w-4 h-4 text-brand-gold" />
              <span>{isAdmin ? "Exit Admin Mode" : "Admin Panel Login"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
