/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { db } from "./src/server/db.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// LAZY GEMINI API CLIENT INITIALIZATION
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required for AI features. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// 1. DYNAMIC API ROUTES
// ----------------------------------------------------

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// BOOKS ENDPOINTS
app.get("/api/books", (req, res) => {
  try {
    const books = db.getBooks();
    res.json(books);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/books/:id", (req, res) => {
  try {
    const book = db.getBookById(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/books", (req, res) => {
  try {
    const newBook = db.addBook(req.body);
    res.status(201).json(newBook);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/books/:id", (req, res) => {
  try {
    const updated = db.updateBook(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Book not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/books/:id", (req, res) => {
  try {
    db.deleteBook(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// BLOG ENDPOINTS
app.get("/api/blogs", (req, res) => {
  try {
    const blogs = db.getBlogs();
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/blogs/:id", (req, res) => {
  try {
    const post = db.getBlogById(req.params.id);
    if (!post) return res.status(404).json({ error: "Blog post not found" });
    res.json(post);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/blogs", (req, res) => {
  try {
    const newPost = db.addBlogPost(req.body);
    res.status(201).json(newPost);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/blogs/:id", (req, res) => {
  try {
    const updated = db.updateBlogPost(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Blog post not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/blogs/:id", (req, res) => {
  try {
    db.deleteBlogPost(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PRINTABLE RESOURCES ENDPOINTS
app.get("/api/resources", (req, res) => {
  try {
    const resources = db.getResources();
    res.json(resources);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/resources", (req, res) => {
  try {
    const resource = db.addResource(req.body);
    res.status(201).json(resource);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/resources/:id/download", (req, res) => {
  try {
    const { email } = req.body;
    const resource = db.incrementResourceDownload(req.params.id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    if (email && resource.isGated) {
      db.addGatedDownload(email, resource.id, resource.title);
      db.addSubscriber(email); // Add gated email subscribers directly to newsletter
    }

    res.json({ success: true, downloadUrl: resource.downloadUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ONLY - RETRIEVE METRICS
app.get("/api/admin/downloads", (req, res) => {
  try {
    const downloads = db.getGatedDownloads();
    res.json(downloads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/subscribers", (req, res) => {
  try {
    const subscribers = db.getSubscribers();
    res.json(subscribers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// NEWSLETTER SUBSCRIPTION
app.post("/api/newsletter/subscribe", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const sub = db.addSubscriber(email);
    if (!sub) {
      return res.json({ success: true, message: "Already subscribed!" });
    }
    res.status(201).json({ success: true, data: sub });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SIMULATE SENDING NEWSLETTER VIA RESEND
app.post("/api/newsletter/send", (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ error: "Subject and Content are required" });
    }
    const subscribers = db.getSubscribers();
    // Simulate SMTP trigger or Resend API trigger
    console.log(`[SIMULATED RESEND] Sending newsletter to ${subscribers.length} active subscribers...`);
    console.log(`[SUBJECT]: ${subject}`);
    res.json({
      success: true,
      deliveredCount: subscribers.length,
      message: `Successfully simulated email dispatch for ${subscribers.length} users.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ORDERS ENDPOINTS (ADMIN AND CHECKOUT)
app.get("/api/orders", (req, res) => {
  try {
    const orders = db.getOrders();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", (req, res) => {
  try {
    const orderData = req.body;
    const order = db.addOrder(orderData);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/orders/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    const updated = db.updateOrderStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// USERS & PROFILE
app.post("/api/users/profile", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const user = db.getUserByEmail(email);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users/wishlist", (req, res) => {
  try {
    const { email, bookId } = req.body;
    if (!email || !bookId) return res.status(400).json({ error: "Email and bookId are required" });
    const user = db.toggleWishlist(email, bookId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// REVIEWS
app.get("/api/reviews/:bookId", (req, res) => {
  try {
    const reviews = db.getReviewsByBook(req.params.bookId);
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reviews", (req, res) => {
  try {
    const review = db.addReview({
      id: "rev-" + Math.random().toString(36).substr(2, 9),
      ...req.body,
      createdAt: new Date().toISOString()
    });
    res.status(201).json(review);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PAYPAL CHECKOUT SIMULATOR
app.post("/api/payments/paypal", (req, res) => {
  try {
    const { cart, customerDetails, shippingAddress, paymentMethodId } = req.body;
    if (!cart || !customerDetails || !customerDetails.email) {
      return res.status(400).json({ error: "Incomplete cart or customer information" });
    }

    const orderId = "PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const isDigitalOnly = cart.every((item: any) => item.format === "digital");
    const isPhysicalOnly = cart.every((item: any) => item.format === "physical");
    const orderType = isDigitalOnly ? "digital" : isPhysicalOnly ? "physical" : "both";

    const items = cart.map((item: any) => ({
      bookId: item.bookId,
      title: item.book.title,
      price: item.format === "digital" ? item.book.priceDigital : item.book.pricePhysical,
      quantity: item.quantity,
      format: item.format,
      imageUrl: item.book.imageUrl
    }));

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const newOrder = {
      id: orderId,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      shippingAddress: orderType === "digital" ? null : shippingAddress,
      items,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: orderType === "digital" ? "delivered" : "pending",
      paymentStatus: "completed",
      paymentId: paymentMethodId || "PP-MOCK-TXN-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      createdAt: new Date().toISOString(),
      type: orderType
    };

    // Add order to DB
    db.addOrder(newOrder as any);

    // Grant instant digital download access to the customer user
    const bookIds = items.map((item: any) => item.bookId);
    db.getUserByEmail(customerDetails.email); // Ensure user profile exists
    db.grantPurchaseAccess(customerDetails.email, bookIds);

    // Automatically trigger newsletter sign up
    db.addSubscriber(customerDetails.email);

    res.status(201).json({
      success: true,
      order: newOrder,
      message: "PayPal simulated checkout completed successfully!"
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// MEDIA GALLERY MANAGER - RETRIEVE MOCK ASSETS
app.get("/api/media", (req, res) => {
  res.json([
    { name: "Anaya's Prayer Cover", url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400" },
    { name: "Brave Shepherd Caleb", url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400" },
    { name: "Meadow Bee Illustration", url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400" },
    { name: "Oak Wise squirrel", url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400" },
    { name: "Generous Seed Sunflower", url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400" }
  ]);
});

// ----------------------------------------------------
// 2. SERVER-SIDE GEMINI AI ENDPOINTS
// ----------------------------------------------------

// INTERACTIVE FAITH ASSISTANT CHATBOT
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getAiClient();
    const books = db.getBooks();

    const bookContext = books.map(b => `- ${b.title} (Ages ${b.ageRange}): Subtitle: "${b.subtitle}". Themes: ${b.themes.join(", ")}. Moral Lesson: "${b.moralLesson}". Bible Verse: "${b.bibleVerse}". Price: $${b.pricePhysical} physical, $${b.priceDigital} PDF.`).join("\n");

    const systemInstruction = `You are "AnayaHelper", the warm, loving, and supportive Christian family storytelling chatbot for "The AnayaSeries" digital publishing platform.
Your goals:
1. Inspire parents, children, Sunday School teachers, and pastors with godly advice, biblical insights, encouraging bedtime thoughts, and beautiful short faith summaries.
2. Recommend the best books from the "AnayaSeries" library to families based on age, themes (e.g. prayer, courage, creation, wisdom, generosity), and moral lessons they are hoping to teach.
3. Speak in a comforting, gentle, and encouraging tone suitable for a premium Christian publisher. Always anchor your answers in biblical truth with love and grace.

The available books on the platform are:
${bookContext}

Always mention these book titles naturally when helping users pick resources, highlighting their Bible verses and age suitability. Keep answers structured, warm, and highly readable.`;

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((turn: any) => {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.content }]
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Gemini AI Chat Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// SMART BOOK RECOMMENDATIONS ENGINE
app.post("/api/ai/recommendations", async (req, res) => {
  try {
    const { prompt, ageRange, theme } = req.body;
    const ai = getAiClient();
    const books = db.getBooks();

    const queryText = `Recommend books for: prompt="${prompt || "None"}", ageRange="${ageRange || "Any"}", theme="${theme || "Any"}"`;

    const systemInstruction = `You are a professional children's bookseller and educational consultant. Analyze the family's query and output a structured list of recommendations in JSON format using books from our catalog.

The available books catalog:
${JSON.stringify(books, null, 2)}

In your recommendation, choose 1 or 2 matching books. Provide:
1. "bookId": The matching book's string ID from our catalog.
2. "matchPercentage": A confidence number between 1 and 100.
3. "recommendationReason": A personalized, warm description explaining why this book teaches the exact virtue they are seeking, linking it to the Bible verse.
4. "parentActivity": A quick 1-sentence activity parents can do at home with their children based on this book.

Output strictly in JSON format. Schema should match a JSON object containing an array called "recommendations".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: queryText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const result = JSON.parse(response.text || '{"recommendations":[]}');
    res.json(result);
  } catch (err: any) {
    console.error("Gemini Recommendations Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI NATURAL LANGUAGE SEMANTIC SEARCH
app.post("/api/ai/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Search query is required" });

    const ai = getAiClient();
    const books = db.getBooks();
    const blogs = db.getBlogs();

    const contentSource = {
      books: books.map(b => ({ id: b.id, title: b.title, subtitle: b.subtitle, description: b.description, categories: b.categories, moralLesson: b.moralLesson, themes: b.themes, bibleVerse: b.bibleVerse, type: "book" })),
      blogs: blogs.map(b => ({ id: b.id, title: b.title, subtitle: b.subtitle, content: b.content.substring(0, 400) + "...", category: b.category, type: "blog" }))
    };

    const systemInstruction = `Analyze the user's natural language search query and rank items from our books or blogs by relevance.

Catalog:
${JSON.stringify(contentSource)}

Output strictly in JSON format. The response should be a JSON array of matching items containing:
- "id": string id of the item
- "type": "book" | "blog"
- "relevanceScore": score from 1 to 100
- "matchingQuote": a short snippet explaining the connection to the search query.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search Query: "${query}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    const results = JSON.parse(response.text || "[]");
    res.json(results);
  } catch (err: any) {
    console.error("Gemini Search Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI READING LEVEL EVALUATION & VIRTUE GENERATOR
app.post("/api/ai/reading-level", async (req, res) => {
  try {
    const { textSnippet, targetAge } = req.body;
    if (!textSnippet) return res.status(400).json({ error: "Text snippet is required" });

    const ai = getAiClient();

    const promptText = `Snippet: "${textSnippet}"
Target Age: ${targetAge || "Not specified"}`;

    const systemInstruction = `You are a children's literacy expert. Analyze the provided children's story snippet or target age. Return a JSON object with:
- "suggestedAgeGroup": the best fit age range (e.g. "0-2", "3-5", "6-8", "9-11")
- "readingLevelGrade": e.g. "Kindergarten", "1st Grade", "4th Grade"
- "moralLessonFound": a brief description of the Christian moral lesson that can be derived from the snippet
- "suggestedBibleVerse": a scripture reference fitting the theme
- "parentDiscussionPrompts": array of 2 discussion starter questions parents can ask their children.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.4,
      }
    });

    const analysis = JSON.parse(response.text || "{}");
    res.json(analysis);
  } catch (err: any) {
    console.error("Gemini Reading Level Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// SITEMAP AUTO-GENERATION
app.get("/sitemap.xml", (req, res) => {
  try {
    const books = db.getBooks();
    const blogs = db.getBlogs();
    const appUrl = process.env.APP_URL || "https://theanayaseries.com";

    const bookUrls = books.map(b => `  <url>
    <loc>${appUrl}/books/${b.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n");

    const blogUrls = blogs.map(b => `  <url>
    <loc>${appUrl}/blog/${b.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${appUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${appUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${appUrl}/books</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${appUrl}/resources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${appUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${appUrl}/schools-churches</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${appUrl}/parents</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
${bookUrls}
${blogUrls}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err: any) {
    res.status(500).send("Error generating sitemap");
  }
});

// ----------------------------------------------------
// 3. VITE MIDDLEWARE SETUP & FRONTEND INTEGRATION
// ----------------------------------------------------

async function start() {
  app.use("/src/assets", express.static(path.join(process.cwd(), "src/assets")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // BIND TO 0.0.0.0 AND PORT 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The AnayaSeries Publishing Platform running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Error starting server:", err);
});
