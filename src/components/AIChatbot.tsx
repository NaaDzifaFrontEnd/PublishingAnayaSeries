/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MessageSquare, X, Send, Sparkles, BookOpen, Heart, HelpCircle, Loader } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

interface AIChatbotProps {
  darkMode: boolean;
  onBookClick?: (bookId: string) => void;
}

export default function AIChatbot({ darkMode, onBookClick }: AIChatbotProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [history, setHistory] = React.useState<Message[]>([
    {
      role: "model",
      content: "Hello! I am **AnayaHelper**, your warm Christian storybook assistant. 🕊️\n\nI can suggest the best books for your child's age group, outline the bible lessons inside our stories, suggest fun prayer triggers, or help you brainstorm bedtime lessons. What would you like to explore today?"
    }
  ]);
  const [loading, setLoading] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const starterChips = [
    { label: "📖 Suggest book for age 4", query: "Which AnayaSeries book is perfect for a 4 year old child?" },
    { label: "🦁 Courage stories", query: "Which books teach courage and trust in God?" },
    { label: "🌻 Teaching generosity", query: "Can you tell me about the story and bible verse of The Generous Seed?" },
    { label: "🙏 Toddler prayer tips", query: "How do I teach my 3 year old to start praying daily?" }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setHistory((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: history.slice(-8) // Keep context compact
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      setHistory((prev) => [...prev, { role: "model", content: data.reply }]);
    } catch (err: any) {
      console.error("AI Assistant Error", err);
      setHistory((prev) => [
        ...prev,
        {
          role: "model",
          content: "I am having a small trouble reaching the heavenly cloud server right now. Let me pray for connection and try again soon! ⛅ (Please ensure your GEMINI_API_KEY secret is defined in the Secrets Panel)."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdown = (text: string) => {
    // Basic bold markdown parser for key concepts
    return text.split("\n").map((line, lIdx) => {
      let elements: React.ReactNode = line;
      
      // Parse bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        elements = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="font-semibold text-brand-green">{part}</strong>;
          }
          return part;
        });
      }

      return (
        <p key={lIdx} className="mb-2 leading-relaxed text-sm last:mb-0">
          {elements}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating launcher bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-brand-green hover:bg-brand-green-light text-brand-cream p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2 group border border-brand-gold/20"
        title="Open AnayaHelper Family AI Companion"
      >
        <Sparkles className="w-5 h-5 text-brand-gold group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-sm font-medium whitespace-nowrap">
          Ask AnayaHelper
        </span>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-gold"></span>
        </span>
      </button>

      {/* Expanded Chat Dialog */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-full sm:w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] rounded-2xl shadow-2xl border transition-colors flex flex-col overflow-hidden ${
          darkMode 
            ? "bg-brand-charcoal border-[#3C3A39] text-brand-cream" 
            : "bg-brand-cream border-stone-200 text-brand-charcoal"
        }`}>
          
          {/* Header */}
          <div className="bg-brand-green px-5 py-4 text-white flex justify-between items-center border-b border-brand-green-dark">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-brand-cream/15 flex items-center justify-center text-brand-gold">
                <Sparkles className="w-4.5 h-4.5 text-brand-gold" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base tracking-tight flex items-center gap-1.5">
                  AnayaHelper
                  <span className="text-[9px] bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider">AI Story Guide</span>
                </h3>
                <p className="text-[10px] text-stone-200">Warm Christian Family Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {history.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm premium-shadow ${
                    msg.role === "user"
                      ? "bg-brand-green text-white rounded-br-none"
                      : darkMode
                        ? "bg-stone-800 border border-[#3C3A39] text-stone-100 rounded-bl-none"
                        : "bg-white border border-stone-200 text-stone-800 rounded-bl-none"
                  }`}
                >
                  <div className="space-y-1">
                    {parseMarkdown(msg.content)}
                  </div>
                  <span className="text-[8.5px] text-stone-400 block text-right mt-1.5 uppercase tracking-widest">
                    {msg.role === "user" ? "Me" : "AnayaHelper"}
                  </span>
                </div>
              </div>
            ))}

            {/* AI Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm rounded-bl-none flex items-center space-x-2 ${
                  darkMode ? "bg-stone-800 text-stone-300" : "bg-white border text-stone-500"
                }`}>
                  <Loader className="w-4 h-4 animate-spin text-brand-gold" />
                  <span className="text-xs italic">Seeking wisdom from the story vault...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Starters list */}
          {history.length === 1 && !loading && (
            <div className="px-4 py-2 border-t border-stone-200/50 bg-stone-50 dark:bg-stone-800/20">
              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1.5">💡 Quick Questions</p>
              <div className="flex flex-wrap gap-1.5">
                {starterChips.map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => handleSendMessage(chip.query)}
                    className="text-[11px] bg-white hover:bg-brand-green hover:text-white border border-stone-200 dark:bg-stone-800 dark:border-stone-700 dark:hover:bg-brand-green transition-all rounded-full py-1.5 px-3 text-stone-600 dark:text-stone-300 cursor-pointer shadow-sm font-medium"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(message);
            }}
            className="p-3 border-t border-stone-200/50 bg-stone-50 dark:bg-[#232221] flex space-x-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about books, lessons, verses..."
              className="flex-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent rounded-full px-4 py-2 text-sm text-brand-charcoal dark:text-brand-cream"
              required
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-brand-green hover:bg-brand-green-light text-brand-cream p-2.5 rounded-full shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-brand-gold" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
