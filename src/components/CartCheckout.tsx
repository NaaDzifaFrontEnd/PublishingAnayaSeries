/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShoppingCart, Trash2, ArrowLeft, ShieldCheck, Mail, User, MapPin, Truck, CheckCircle2, ArrowRight, Download, CreditCard, Sparkles } from "lucide-react";
import { CartItem, Book } from "../types.js";

interface CartCheckoutProps {
  darkMode: boolean;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setCurrentPage: (page: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
}

export default function CartCheckout({
  darkMode,
  cart,
  setCart,
  setCurrentPage,
  userEmail,
  setUserEmail
}: CartCheckoutProps) {
  const [step, setStep] = React.useState<"cart" | "checkout" | "success">("cart");
  const [couponCode, setCouponCode] = React.useState("");
  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [couponError, setCouponError] = React.useState("");
  const [couponSuccess, setCouponSuccess] = React.useState("");
  
  // Checkout Form Details
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState(userEmail || "");
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [zipCode, setZipCode] = React.useState("");
  const [country, setCountry] = React.useState("United States");
  
  // Payment Simulation
  const [isPaying, setIsPaying] = React.useState(false);
  const [paymentSuccessOrder, setPaymentSuccessOrder] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (userEmail && !email) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  const updateQuantity = (bookId: string, format: "physical" | "digital", amount: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.bookId === bookId && item.format === format) {
            const newQty = item.quantity + amount;
            return { ...item, quantity: newQty < 1 ? 1 : newQty };
          }
          return item;
        })
    );
  };

  const removeItem = (bookId: string, format: "physical" | "digital") => {
    setCart((prev) => prev.filter((item) => !(item.bookId === bookId && item.format === format)));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (couponCode.toUpperCase() === "ANAYAFAMILY") {
      setDiscountPercent(15);
      setCouponSuccess("15% Anaya Family discount applied successfully!");
    } else if (couponCode.toUpperCase() === "SUNDAYSCHOOL") {
      setDiscountPercent(20);
      setCouponSuccess("20% Sunday School partner discount applied!");
    } else {
      setCouponError("Invalid promo code. Try ANAYAFAMILY.");
    }
  };

  const hasPhysical = cart.some((item) => item.format === "physical");
  const isCartEmpty = cart.length === 0;

  // Calculators
  const subtotal = cart.reduce((sum, item) => {
    const price = item.format === "digital" ? item.book.priceDigital : item.book.pricePhysical;
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = subtotal * (discountPercent / 100);
  const afterDiscount = subtotal - discountAmount;
  const shippingCost = hasPhysical ? 4.99 : 0;
  const taxCost = afterDiscount * 0.08;
  const totalAmount = afterDiscount + shippingCost + taxCost;

  const handlePayPalCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaying) return;

    setIsPaying(true);

    try {
      const response = await fetch("/api/payments/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((item) => ({
            bookId: item.bookId,
            book: item.book,
            quantity: item.quantity,
            format: item.format
          })),
          customerDetails: { name, email },
          shippingAddress: hasPhysical ? { street, city, state, zipCode, country } : null,
          paymentMethodId: "PAYPAL-MOCK-TXN-" + Math.floor(Math.random() * 100000)
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentSuccessOrder(result.order);
        setUserEmail(email); // Bind userEmail context
        setCart([]); // Empty the cart
        setStep("success");
      }
    } catch (err) {
      console.error("PayPal simulation error", err);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Dynamic Header */}
      <div className="flex items-center space-x-2 text-sm text-stone-500 mb-8">
        <button onClick={() => {
          if (step === "checkout") setStep("cart");
          else setCurrentPage("store");
        }} className="hover:text-brand-green flex items-center space-x-1 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span>{step === "checkout" ? "Back to Cart" : "Continue Shopping"}</span>
        </button>
      </div>

      {step === "cart" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-brand-green tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-brand-gold" />
              <span>Shopping Cart</span>
            </h2>

            {isCartEmpty ? (
              <div className="bg-white dark:bg-[#232221] border dark:border-[#3C3A39] rounded-2xl p-12 text-center shadow-sm">
                <p className="text-stone-400 text-lg mb-6">Your shopping basket is empty. Browse our storybooks to start seeding faith!</p>
                <button
                  onClick={() => setCurrentPage("store")}
                  className="bg-brand-green hover:bg-brand-green-light text-brand-cream px-6 py-3 rounded-full text-xs font-bold shadow-md cursor-pointer inline-flex items-center space-x-1"
                >
                  <span>Browse Books Shop</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => {
                  const currentPrice = item.format === "digital" ? item.book.priceDigital : item.book.pricePhysical;
                  return (
                    <div
                      key={idx}
                      className={`p-4 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                        darkMode 
                          ? "bg-[#232221] border-[#3C3A39] text-brand-cream" 
                          : "bg-white border-stone-200 text-brand-charcoal"
                      } premium-shadow`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.book.imageUrl}
                          alt={item.book.title}
                          className="w-16 h-20 object-cover rounded shadow border"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-base leading-tight tracking-tight">{item.book.title}</h4>
                          <p className="text-[10px] text-[#8C867A] uppercase tracking-widest mt-0.5">{item.book.author}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.format === "digital" 
                                ? "bg-amber-100 text-amber-800 border border-amber-200" 
                                : "bg-sky-100 text-sky-800 border border-sky-200"
                            }`}>
                              {item.format === "digital" ? "📥 Digital PDF" : "📖 Physical Book"}
                            </span>
                            <span className="text-xs font-semibold text-stone-500">${currentPrice} each</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                        {/* Qty controller */}
                        <div className="flex items-center border border-stone-300 dark:border-stone-700 rounded-full bg-stone-50 dark:bg-stone-800/40">
                          <button
                            onClick={() => updateQuantity(item.bookId, item.format, -1)}
                            className="px-3 py-1 text-sm font-bold text-stone-500 hover:text-brand-green"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-brand-charcoal dark:text-brand-cream">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.bookId, item.format, 1)}
                            className="px-3 py-1 text-sm font-bold text-stone-500 hover:text-brand-green"
                          >
                            +
                          </button>
                        </div>

                        {/* Price & Bin */}
                        <div className="text-right flex items-center gap-4">
                          <span className="font-bold text-brand-green font-serif">${(currentPrice * item.quantity).toFixed(2)}</span>
                          <button
                            onClick={() => removeItem(item.bookId, item.format)}
                            className="text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing Summary Side */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-brand-green tracking-tight">Order Summary</h3>
            
            <div className={`p-6 rounded-2xl border transition-colors ${
              darkMode 
                ? "bg-[#232221] border-[#3C3A39]" 
                : "bg-white border-stone-200"
            } premium-shadow`}>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-charcoal dark:text-brand-cream">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-500">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-brand-charcoal dark:text-brand-cream">
                    {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "FREE"}
                  </span>
                </div>

                <div className="flex justify-between text-stone-500">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-brand-charcoal dark:text-brand-cream">${taxCost.toFixed(2)}</span>
                </div>

                <div className="border-t border-stone-200 dark:border-stone-800/40 pt-4 flex justify-between font-serif text-lg font-bold text-brand-green">
                  <span>Order Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo input */}
              <form onSubmit={handleApplyCoupon} className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-800/40 space-y-2">
                <label className="text-xs font-semibold text-stone-400 block uppercase">Have a coupon code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ANAYAFAMILY"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold bg-transparent uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-brand-green hover:bg-brand-green-light text-white text-xs px-4 py-2 rounded-xl cursor-pointer font-bold"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>}
              </form>

              {/* Checkout trigger */}
              <button
                onClick={() => setStep("checkout")}
                disabled={isCartEmpty}
                className="w-full bg-brand-gold hover:bg-brand-gold-light text-brand-green-dark font-bold text-sm py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer mt-8 flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 flex items-center justify-center space-x-1.5 text-stone-400 text-[10px] font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4.5 h-4.5 text-brand-gold" />
                <span>Secure Checkout Secured</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {step === "checkout" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Customer checkout credentials */}
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold text-brand-green tracking-tight">Checkout Details</h2>
            
            <form onSubmit={handlePayPalCheckout} className={`p-6 rounded-2xl border space-y-4 ${
              darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
            } premium-shadow`}>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-400 uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Your Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel and Joanna"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold bg-transparent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-400 uppercase flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email for Digital Download Receipt</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="family@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold bg-transparent"
                />
                <span className="text-[10px] text-stone-400 block">
                  🕊️ This email grants immediate digital downloads access under the Accounts dashboard!
                </span>
              </div>

              {hasPhysical && (
                <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800/40">
                  <h3 className="font-serif text-lg font-bold text-brand-green flex items-center gap-1.5">
                    <Truck className="w-5 h-5 text-brand-gold" />
                    <span>Physical Shipping Address</span>
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-400 uppercase flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Street Address</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123 Faith Way"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold bg-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-400 uppercase">City</label>
                      <input
                        type="text"
                        required
                        placeholder="Graceville"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold bg-transparent"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-400 uppercase">State / Province</label>
                      <input
                        type="text"
                        required
                        placeholder="TX"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-400 uppercase">Zip / Postal Code</label>
                      <input
                        type="text"
                        required
                        placeholder="75001"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold bg-transparent"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-400 uppercase">Country</label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal simulation container */}
              <div className="pt-6 border-t border-stone-200 dark:border-stone-800/40">
                <div className="bg-[#FFC439]/15 border border-[#FFC439] rounded-2xl p-5 text-center space-y-4">
                  <div className="flex items-center justify-center space-x-1 text-[#003087]">
                    <span className="font-serif text-lg font-black italic tracking-tighter">Pay</span>
                    <span className="font-serif text-lg font-black italic tracking-tighter text-[#0079C1]">Pal</span>
                    <span className="text-[10px] bg-[#0079C1] text-white px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ml-2 font-bold">Secure Sandbox</span>
                  </div>
                  <p className="text-xs text-[#003087] font-medium">
                    This simulated checkout allows direct demonstration of dynamic order creations, instant account setup, and email dispatches.
                  </p>

                  <button
                    type="submit"
                    disabled={isPaying || !name || !email || (hasPhysical && (!street || !city || !state || !zipCode))}
                    className="w-full bg-[#FFC439] hover:bg-[#F2B522] text-[#003087] font-extrabold py-3.5 px-4 rounded-xl shadow-md cursor-pointer text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isPaying ? (
                      <span className="animate-pulse">Authorizing PayPal Mock Payment...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-[#003087]" />
                        <span>Simulate PayPal Payment of ${totalAmount.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Checkout Right Review Column */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-brand-green tracking-tight">Review Order Items</h3>
            
            <div className={`p-6 rounded-2xl border transition-colors ${
              darkMode ? "bg-[#232221] border-[#3C3A39]" : "bg-white border-stone-200"
            } premium-shadow space-y-4`}>
              <div className="divide-y divide-stone-100 dark:divide-stone-800/40 max-h-80 overflow-y-auto pr-2">
                {cart.map((item, idx) => {
                  const itemPrice = item.format === "digital" ? item.book.priceDigital : item.book.pricePhysical;
                  return (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <img
                          src={item.book.imageUrl}
                          alt={item.book.title}
                          className="w-9 h-12 object-cover rounded shadow border"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold font-serif leading-tight">{item.book.title}</p>
                          <span className="text-[9px] uppercase tracking-wider text-[#8C867A]">Qty: {item.quantity} · {item.format}</span>
                        </div>
                      </div>
                      <span className="font-bold text-brand-green">${(itemPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-stone-200 dark:border-stone-800/40 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500">
                  <span>Shipping</span>
                  <span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "FREE"}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Sales Tax (8%)</span>
                  <span>${taxCost.toFixed(2)}</span>
                </div>
                <div className="border-t border-stone-100 dark:border-stone-800/40 pt-3 flex justify-between text-base font-serif font-bold text-brand-green">
                  <span>Grand Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {step === "success" && paymentSuccessOrder && (
        <div className="max-w-2xl mx-auto text-center space-y-8 bg-white dark:bg-[#232221] border dark:border-[#3C3A39] p-8 sm:p-12 rounded-3xl premium-shadow border-brand-green/10">
          
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest bg-brand-green/10 px-3 py-1.5 rounded-full border border-brand-green/25">
              Secure Sandbox Completed
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-green tracking-tight">
              Glory to God! Order Placed
            </h2>
            <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
              We have processed your simulated PayPal payment of **${paymentSuccessOrder.totalAmount}**. Your official invoice is logged below, and your instant downloads are pre-loaded.
            </p>
          </div>

          {/* Invoice card */}
          <div className="bg-stone-50 dark:bg-stone-800/20 border rounded-2xl p-6 text-left space-y-4">
            <div className="flex justify-between text-xs font-bold border-b pb-3 text-stone-500">
              <span>MOCK TRANSACTION RECEIPT</span>
              <span className="text-brand-green uppercase tracking-wider">{paymentSuccessOrder.id}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400 font-medium">Customer Name:</span>
                <span className="font-semibold text-brand-charcoal dark:text-brand-cream">{paymentSuccessOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 font-medium">Customer Email:</span>
                <span className="font-semibold text-brand-charcoal dark:text-brand-cream">{paymentSuccessOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400 font-medium">Order Date:</span>
                <span className="font-semibold text-brand-charcoal dark:text-brand-cream">
                  {new Date(paymentSuccessOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              {paymentSuccessOrder.shippingAddress && (
                <div className="flex justify-between items-start">
                  <span className="text-stone-400 font-medium shrink-0">Ship Address:</span>
                  <span className="font-semibold text-brand-charcoal dark:text-brand-cream text-right">
                    {paymentSuccessOrder.shippingAddress.street}, {paymentSuccessOrder.shippingAddress.city}, {paymentSuccessOrder.shippingAddress.state} {paymentSuccessOrder.shippingAddress.zipCode}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed pt-4 space-y-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ordered Items</p>
              {paymentSuccessOrder.items.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs text-stone-600 dark:text-stone-300">
                  <span>{it.title} ({it.format}) x{it.quantity}</span>
                  <span className="font-semibold font-mono">${it.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action redirects */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setCurrentPage("account")}
              className="flex-1 bg-brand-green hover:bg-brand-green-light text-white font-bold text-sm py-3 px-4 rounded-xl shadow transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Download className="w-4.5 h-4.5 text-brand-gold" />
              <span>Go to My PDFs Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage("store")}
              className="flex-1 border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-sm py-3 px-4 rounded-xl transition-all cursor-pointer"
            >
              Browse More Books
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
