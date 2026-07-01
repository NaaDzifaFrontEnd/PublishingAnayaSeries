/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  illustrator: string;
  isbn: string;
  description: string;
  pricePhysical: number;
  priceDigital: number;
  imageUrl: string;
  pdfUrl: string; // The downloadable PDF content
  ageRange: string; // e.g., "0-2", "3-5", "6-8", "9-11"
  categories: string[]; // e.g., ["Prayer", "Courage", "Bible Stories", "Activity Book"]
  bibleVerse: string; // Key foundational scripture
  moralLesson: string; // The central value taught
  themes: string[]; // e.g., ["Love", "Kindness", "Obedience"]
  readingTime: string; // e.g., "10 mins"
  pageCount: number;
  isFeatured: boolean;
  stock: number;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  gallery: string[];
}

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  format: "physical" | "digital";
  imageUrl: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "shipped" | "delivered" | "canceled";
  paymentStatus: "pending" | "completed" | "refunded";
  paymentId: string;
  createdAt: string;
  type: "physical" | "digital" | "both";
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  content: string; // Markdown or HTML rich text
  author: string;
  imageUrl: string;
  category: string;
  status: "draft" | "published";
  createdAt: string;
  readTime: string;
}

export interface PrintableResource {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl: string;
  downloadCount: number;
  isGated: boolean;
  ageRange: string;
}

export interface GatedDownload {
  id: string;
  email: string;
  resourceId: string;
  resourceTitle: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  wishlist: string[]; // Book IDs
  purchasedBooks: string[]; // Book IDs with digital access
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  bookId: string;
  book: Book;
  quantity: number;
  format: "physical" | "digital";
}
