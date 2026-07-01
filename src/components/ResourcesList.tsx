/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Download, Mail, ArrowRight, CheckCircle2, Lock, FileText, Gift } from "lucide-react";
import { PrintableResource } from "../types.js";

interface ResourcesListProps {
  darkMode: boolean;
}

export default function ResourcesList({ darkMode }: ResourcesListProps) {
  const [resources, setResources] = React.useState<PrintableResource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedResource, setSelectedResource] = React.useState<PrintableResource | null>(null);
  const [email, setEmail] = React.useState("");
  const [gateUnlocked, setGateUnlocked] = React.useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading resources", err);
        setLoading(false);
      });
  }, []);

  const handleUnlockAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource || !email) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/resources/${selectedResource.id}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setGateUnlocked((prev) => ({ ...prev, [selectedResource.id]: true }));
        
        // Update download count locally
        setResources((prev) =>
          prev.map((r) =>
            r.id === selectedResource.id ? { ...r, downloadCount: r.downloadCount + 1 } : r
          )
        );

        // Simulate file download trigger
        const mockFileContent = "PDF file content stream of AnayaSeries resource activity book.";
        const blob = new Blob([mockFileContent], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedResource.id}-printable.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Reset selected state
        setSelectedResource(null);
        setEmail("");
      }
    } catch (err) {
      console.error("Unlock error", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFreeDownload = async (resource: PrintableResource) => {
    try {
      const res = await fetch(`/api/resources/${resource.id}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (res.ok) {
        setResources((prev) =>
          prev.map((r) =>
            r.id === resource.id ? { ...r, downloadCount: r.downloadCount + 1 } : r
          )
        );

        const blob = new Blob(["Free downloadable bible material"], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resource.id}-free.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Free download error", err);
    }
  };

  return (
    <div className="py-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 px-4">
        <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-brand-green/10 px-3 py-1.5 rounded-full border border-brand-green/25">
          Home Schooling & Sunday School
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-brand-green mt-4 mb-4">
          Free Printable Activities
        </h2>
        <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? "text-stone-300" : "text-stone-600"}`}>
          Bring story lessons to life with our hand-drawn coloring sheets, Scripture memory verse cards, and interactive prayer calendars. Perfect for living rooms, homeschool classrooms, and Sunday schools.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse space-y-4 text-center">
            <FileText className="w-12 h-12 text-brand-green/40 mx-auto animate-bounce" />
            <p className="text-sm text-stone-500">Unpacking family crafts shelf...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {resources.map((res) => {
            const isUnlocked = gateUnlocked[res.id];
            return (
              <div
                key={res.id}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 premium-shadow premium-shadow-hover flex flex-col ${
                  darkMode 
                    ? "bg-[#232221] border-[#3C3A39] text-brand-cream" 
                    : "bg-white border-stone-200 text-brand-charcoal"
                }`}
              >
                {/* Cover representation */}
                <div className="h-48 bg-stone-100 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={res.imageUrl}
                    alt={res.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-brand-green/95 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-brand-gold/20 shadow uppercase tracking-widest">
                    Ages {res.ageRange}
                  </div>
                  {res.isGated && (
                    <div className="absolute bottom-3 right-3 bg-brand-gold text-brand-green-dark text-[10px] font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Gated Parent Email</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold mb-2 tracking-tight hover:text-brand-green transition-colors">
                      {res.title}
                    </h3>
                    <p className={`text-xs leading-relaxed mb-4 line-clamp-3 ${darkMode ? "text-stone-400" : "text-stone-500"}`}>
                      {res.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800/40 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                      📥 {res.downloadCount} Downloads
                    </span>

                    {res.isGated && !isUnlocked ? (
                      <button
                        onClick={() => setSelectedResource(res)}
                        className="bg-brand-green hover:bg-brand-green-light text-brand-cream px-4 py-2 rounded-full text-xs font-semibold flex items-center space-x-1.5 shadow transition-all cursor-pointer border border-brand-gold/10"
                      >
                        <Lock className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Unlock Free</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (res.isGated) {
                            handleUnlockAndDownload(res as any);
                          } else {
                            handleFreeDownload(res);
                          }
                        }}
                        className="bg-brand-gold hover:bg-brand-gold-light text-brand-green-dark px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gated Unlock Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors border ${
            darkMode ? "bg-brand-charcoal border-[#3C3A39] text-brand-cream" : "bg-white border-stone-200 text-brand-charcoal"
          }`}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-gold mx-auto mb-3">
                <Gift className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-green">Unlock Free Printable</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Enter your email address below to immediately download the **{selectedResource.title}** bundle as a printable PDF.
              </p>
            </div>

            <form onSubmit={handleUnlockAndDownload} className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-stone-400" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedResource(null)}
                  className="flex-1 border py-2.5 rounded-xl text-xs font-semibold cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !email}
                  className="flex-1 bg-brand-green hover:bg-brand-green-light text-white py-2.5 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? "Unlocking..." : "Get PDF Now"}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
                </button>
              </div>
            </form>

            <p className="text-[10px] text-center text-stone-400 mt-4">
              🕊️ Submitting joins our free parent-Sunday school list. Unsubscribe anytime.
            </p>
          </div>
        </div>
      )}

      {/* Sunday School Bundle Highlight Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="rounded-3xl green-gradient p-8 sm:p-12 text-white relative overflow-hidden border border-brand-gold/15 premium-shadow">
          <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none">
            <FileText className="w-80 h-80 rotate-12 transform translate-x-20 translate-y-20 text-brand-gold" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full border border-brand-gold/25 inline-block mb-4">
              Sunday School Curriculum
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold mb-4 tracking-tight">
              Looking for a custom Church coloring pack?
            </h3>
            <p className="text-stone-200 text-sm leading-relaxed mb-6">
              If your church is preparing for a Vacation Bible School (VBS), summer camp, or Sunday class series, contact our publishing team. We compile specialized printable activity packets matching our books to your lesson timelines for free!
            </p>
            <button
              onClick={() => {}}
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-green-dark px-6 py-3 rounded-full text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>VBS Support Request</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
