/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { Book, BlogPost, PrintableResource, Order, NewsletterSubscriber, GatedDownload, User, Review } from "../types.js";

const DB_FILE = path.join(process.cwd(), "db.json");

interface DBStructure {
  books: Book[];
  blogPosts: BlogPost[];
  resources: PrintableResource[];
  orders: Order[];
  subscribers: NewsletterSubscriber[];
  downloads: GatedDownload[];
  users: User[];
  reviews: Review[];
}

const DEFAULT_BOOKS: Book[] = [
  {
    id: "anayas-first-prayer",
    title: "Anaya's First Prayer",
    subtitle: "A Heart-to-Heart Talk with God",
    author: "Joanna Anaya",
    illustrator: "Evelyn Gray",
    isbn: "978-1-234567-01-2",
    description: "Anaya discovers that praying isn't about reciting long, complicated words, but about having a loving, simple conversation with God. This beautifully illustrated book guides young children through their first steps of forming a daily prayer habit, showing them that God always listens with an open heart.",
    pricePhysical: 12.99,
    priceDigital: 4.99,
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
    pdfUrl: "/downloads/anayas-first-prayer.pdf",
    ageRange: "3-5",
    categories: ["Prayer", "Faith Formation", "Daily Habits"],
    bibleVerse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. - Philippians 4:6",
    moralLesson: "God is always ready to listen, and we can talk to Him just like we talk to a trusted friend.",
    themes: ["Prayer", "Trust", "Gratitude"],
    readingTime: "8 mins",
    pageCount: 24,
    isFeatured: true,
    stock: 45,
    status: "published",
    seoTitle: "Anaya's First Prayer | Children's Christian Prayer Book",
    seoDescription: "A beautiful Christian children's book that teaches toddlers and young children how to talk to God through simple, loving, and everyday prayers.",
    seoKeywords: ["children's prayer", "christian kids book", "anaya series", "first prayer"],
    gallery: [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400"
    ]
  },
  {
    id: "the-brave-shepherd",
    title: "The Brave Shepherd",
    subtitle: "Finding Courage in God's Shelter",
    author: "David Anaya",
    illustrator: "Marcus Vance",
    isbn: "978-1-234567-02-9",
    description: "Follow the thrilling journey of Caleb, a young shepherd boy in ancient Israel, who must protect his flock from sudden dangers in the wilderness. Caleb learns that true courage doesn't come from his own strength, but from trusting that God is always protecting and shielding him.",
    pricePhysical: 14.99,
    priceDigital: 5.99,
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400",
    pdfUrl: "/downloads/the-brave-shepherd.pdf",
    ageRange: "6-8",
    categories: ["Bible Stories", "Courage", "Trust"],
    bibleVerse: "Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me. - Psalm 23:4",
    moralLesson: "We do not have to be afraid of life's shadows because God's presence is our ultimate shield and comfort.",
    themes: ["Courage", "Protection", "Bible History"],
    readingTime: "12 mins",
    pageCount: 32,
    isFeatured: true,
    stock: 30,
    status: "published",
    seoTitle: "The Brave Shepherd | Faith & Courage Book for Kids",
    seoDescription: "An inspiring Christian children's book based on Biblical concepts of Shepherd protection and courage, helping kids overcome their fears.",
    seoKeywords: ["brave shepherd", "christian kids courage", "bible stories Caleb", "fear protection children"],
    gallery: [
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400"
    ]
  },
  {
    id: "miracles-in-the-meadow",
    title: "Miracles in the Meadow",
    subtitle: "A Little Bee's Gratitude Journey",
    author: "Joanna Anaya",
    illustrator: "Sophia Meadows",
    isbn: "978-1-234567-03-6",
    description: "Barnaby the little bumblebee takes a gorgeous morning flight across a vibrant meadow, discovering how every flower, stream, and warm sunbeam tells a story of God's perfect design. Designed with simple rhymes for toddlers, this story fosters a heart of praise and gratitude for the small miracles of creation.",
    pricePhysical: 9.99,
    priceDigital: 3.99,
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    pdfUrl: "/downloads/miracles-in-the-meadow.pdf",
    ageRange: "0-2",
    categories: ["Creation", "Gratitude", "Praise"],
    bibleVerse: "God saw all that he had made, and it was very good. - Genesis 1:31",
    moralLesson: "Every small part of nature is a beautiful miracle crafted with love by God, giving us a reason to say thank you.",
    themes: ["Creation", "Thankfulness", "Toddler Rhymes"],
    readingTime: "5 mins",
    pageCount: 16,
    isFeatured: false,
    stock: 60,
    status: "published",
    seoTitle: "Miracles in the Meadow | Creation Book for Toddlers",
    seoDescription: "A simple, rhyming Christian board book for toddlers celebrating God's creation through the eyes of a cheerful little bee.",
    seoKeywords: ["creation book", "christian toddlers", "gratitude book", "kids nature praise"],
    gallery: []
  },
  {
    id: "wisdom-of-the-oak",
    title: "Wisdom of the Oak",
    subtitle: "The Importance of Listening",
    author: "David Anaya",
    illustrator: "Eleanor Finch",
    isbn: "978-1-234567-04-3",
    description: "In the Whispering Woods, Oliver the Squirrel is always talking, racing around, and making plans without ever pausing to listen to the wise advice of the ancient Oak Tree. When a heavy storm threatens the forest, Oliver learns that wisdom begins with a quiet spirit and an open ear to godly guidance.",
    pricePhysical: 13.99,
    priceDigital: 5.49,
    imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400",
    pdfUrl: "/downloads/wisdom-of-the-oak.pdf",
    ageRange: "9-11",
    categories: ["Wisdom", "Respect", "Family Guidance"],
    bibleVerse: "The beginning of wisdom is this: Get wisdom. Though it cost all you have, get understanding. - Proverbs 4:7",
    moralLesson: "Pausing to listen to our elders and seeking godly wisdom helps us navigate life's unexpected storms.",
    themes: ["Wisdom", "Attentiveness", "Patience"],
    readingTime: "15 mins",
    pageCount: 36,
    isFeatured: true,
    stock: 12,
    status: "published",
    seoTitle: "Wisdom of the Oak | Character Building Book for Kids",
    seoDescription: "A character-building story for pre-teens about learning patience, listening to guidance, and applying Biblical wisdom in daily life.",
    seoKeywords: ["children wisdom book", "christian character building", "kids listening skills", "proverbs for kids"],
    gallery: []
  },
  {
    id: "the-generous-seed",
    title: "The Generous Seed",
    subtitle: "Sowing Seeds of Joy",
    author: "Joanna Anaya",
    illustrator: "Olivia Reed",
    isbn: "978-1-234567-05-0",
    description: "A little seed named Silas dreams of growing into the tallest, grandest sunflower in the field, keeping all his beautiful petals for himself. But when he meets a group of hungry little birds and tired field mice, Silas decides to share his seeds, discovering that true joy is found in cheerful giving.",
    pricePhysical: 11.99,
    priceDigital: 4.49,
    imageUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400",
    pdfUrl: "/downloads/the-generous-seed.pdf",
    ageRange: "3-5",
    categories: ["Generosity", "Kindness", "Friendship"],
    bibleVerse: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver. - 2 Corinthians 9:7",
    moralLesson: "Sharing what we have doesn't make us poorer; it fills our hearts and our community with God's perfect joy.",
    themes: ["Generosity", "Sharing", "Kindness"],
    readingTime: "7 mins",
    pageCount: 20,
    isFeatured: false,
    stock: 25,
    status: "published",
    seoTitle: "The Generous Seed | Christian Sharing Book for Children",
    seoDescription: "A delightful illustrated children's story about Silas the seed, teaching the joy of generosity and cheerful sharing.",
    seoKeywords: ["cheerful giver book", "christian sharing for kids", "teaching generosity", "moral stories kids"],
    gallery: []
  },
  {
    id: "journey-100th-sheep",
    title: "The Journey of the 100th Sheep",
    subtitle: "A Story of God's Relentless Love",
    author: "Joanna Anaya",
    illustrator: "Evelyn Gray",
    isbn: "978-1-234567-06-7",
    description: "Meet Sammy, a cheerful little lamb who wanders a bit too far while chasing a butterfly. When night falls, he learns that he is never truly lost, as the Good Shepherd climbs the steepest hills and braves the dark to find him and carry him home with joy. A comforting and sweet retelling of the classic parable for little hearts.",
    pricePhysical: 14.99,
    priceDigital: 5.99,
    imageUrl: "/src/assets/images/hundredth_sheep_1782922880387.jpg",
    pdfUrl: "/downloads/journey-100th-sheep.pdf",
    ageRange: "3-5",
    categories: ["Bible Stories", "God's Love", "Parables"],
    bibleVerse: "What do you think? If a man owns a hundred sheep, and one of them wanders away, will he not leave the ninety-nine on the hills and go to look for the one that wandered off? - Matthew 18:12",
    moralLesson: "No matter where we go or how far we feel we have wandered, God will always seek us out and bring us safely home because we are incredibly precious to Him.",
    themes: ["Love", "Belonging", "Trust"],
    readingTime: "8 mins",
    pageCount: 24,
    isFeatured: true,
    stock: 35,
    status: "published",
    seoTitle: "The Journey of the 100th Sheep | Christian Parable Book",
    seoDescription: "A heartwarming retelling of the lost sheep parable for toddlers and young children, teaching them about the Good Shepherd's love.",
    seoKeywords: ["lost sheep", "good shepherd", "christian kids book", "bible parables kids"],
    gallery: []
  },
  {
    id: "story-little-wisdom",
    title: "The Story of Little Wisdom",
    subtitle: "the Voice that calls",
    author: "David Anaya",
    illustrator: "Marcus Vance",
    isbn: "978-1-234567-07-4",
    description: "In a beautiful woodland clearing, a group of curious children gather to listen to the gentle whispers of the wind, learning to discern the difference between the loud noises of the world and the quiet, comforting voice of God's wisdom. Through delightful characters and natural illustrations, children are encouraged to quiet their hearts, listen attentively, and follow God's loving path.",
    pricePhysical: 13.99,
    priceDigital: 4.99,
    imageUrl: "/src/assets/images/little_wisdom_1782922891796.jpg",
    pdfUrl: "/downloads/story-little-wisdom.pdf",
    ageRange: "6-8",
    categories: ["Wisdom", "Faith Formation", "Listening to God"],
    bibleVerse: "My sheep listen to my voice; I know them, and they follow me. - John 10:27",
    moralLesson: "Wisdom begins when we quiet our hearts to listen to the loving voice of God, choosing to follow His guidance over the loud distractions of the world.",
    themes: ["Wisdom", "Quietness", "Discipleship"],
    readingTime: "10 mins",
    pageCount: 28,
    isFeatured: true,
    stock: 40,
    status: "published",
    seoTitle: "The Story of Little Wisdom | Listening to God's Voice",
    seoDescription: "A beautiful story teaching children how to quiet their hearts and listen to God's wise and gentle guidance.",
    seoKeywords: ["little wisdom", "listening to God", "christian kids book", "wisdom for children"],
    gallery: []
  }
];

const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: "building-prayer-habit",
    title: "Building a Daily Prayer Habit in Young Children",
    subtitle: "Practical and warm advice for parents looking to integrate natural prayer into their daily home rhythm.",
    author: "Joanna Anaya",
    content: `Many parents wonder how early they should start teaching their children to pray, and how to keep it from feeling like a chore. The secret is simplicity and consistency!

### 1. Model Simple, Conversational Prayer
Children learn best by observing what we do. Instead of only reciting formal prayers, let your children hear you talk to God naturally during the day:
* "Thank you, Lord, for this beautiful sunny afternoon!"
* "God, please help us stay safe as we drive to school."
* "Lord, give me patience right now as we clean up this spill."

### 2. Connect Prayer to Daily Anchors
Integrate brief prayers into key transition moments:
* **The Morning Wake-up:** A simple "Thank you, God, for a new day!"
* **Meal Times:** Expressing active gratitude for provision.
* **The Bedtime Tuck-In:** Reviewing the highlights of the day and thanking God, then asking Him to shield their sleep.

### 3. Keep It Brief and Authentic
For toddlers (ages 2-5), a prayer should rarely exceed 3 or 4 sentences. Let them fill in the blanks: "God, thank you for [let them say a name/object] today." This shows them prayer is an interactive and active relationship, not a lecture!`,
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
    category: "Parenting",
    status: "published",
    createdAt: "2026-06-15T10:00:00Z",
    readTime: "5 min read"
  },
  {
    id: "sharing-gospel-living-room",
    title: "Sharing the Gospel in Your Living Room",
    subtitle: "Transforming ordinary family nights into inspiring, faith-affirming adventures.",
    author: "David Anaya",
    content: `You don't need a theology degree or a stage to build a deep spiritual foundation for your children. Your living room sofa is the most effective classroom in the world! Here are three keys to making family devotionals a high point of the week:

### 1. Make It Interactive
Avoid simply reading a long chapter of text while your kids sit quietly. Instead, dramatize the scene!
* When reading about **Noah's Ark**, have the children gather stuffed animals and make rain sound effects by tapping their fingers on the floor.
* When exploring **The Brave Shepherd Caleb**, turn down the lights and use a flashlight as Caleb's torch protecting the sheep.

### 2. Anchor Stories to Real Questions
Connect the bible stories directly to their school or playground experiences. If Caleb trusted God when he was afraid in the dark wilderness, ask your children:
* "What is a shadow or a situation that made you feel scared this week? How can Caleb's shepherd shield help us pray?"

### 3. Cultivate Joy over Duty
If a devotion is running long and the children are getting restless, don't force it. End on a high note! A warm, fun 10-minute storytelling session leaves them wanting more, whereas an hour-long lecture can create unnecessary friction. Celebrate faith with warmth and joy!`,
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=400",
    category: "Family Devotionals",
    status: "published",
    createdAt: "2026-06-25T14:30:00Z",
    readTime: "7 min read"
  }
];

const DEFAULT_RESOURCES: PrintableResource[] = [
  {
    id: "noahs-ark-coloring-page",
    title: "Noah's Ark Coloring Sheet & Animal Match",
    description: "A gorgeous, high-contrast coloring sheet featuring Noah's Ark, combined with a fun animal-matching cut-out game. Designed to reinforce lessons of obedience, patience, and God's secure promises.",
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    downloadUrl: "/downloads/noahs-ark-activity.pdf",
    downloadCount: 142,
    isGated: true,
    ageRange: "3-5"
  },
  {
    id: "lords-prayer-family-tracker",
    title: "The Lord's Prayer Daily Family Tracker",
    description: "An interactive, colorful wall chart that helps families track daily prayer milestones and break down the parts of the Lord's prayer (praise, petition, forgiveness, protection) in a kid-friendly format.",
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
    downloadUrl: "/downloads/lords-prayer-tracker.pdf",
    downloadCount: 89,
    isGated: true,
    ageRange: "6-8"
  },
  {
    id: "fruit-of-the-spirit-activity",
    title: "Fruit of the Spirit Word Search & Memory Cards",
    description: "An engaging printable activity book featuring structured word searches, fun crosswords, and beautiful scripture memory cards focusing on love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.",
    imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400",
    downloadUrl: "/downloads/fruit-of-spirit-activity.pdf",
    downloadCount: 115,
    isGated: true,
    ageRange: "9-11"
  }
];

function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DBStructure = {
        books: DEFAULT_BOOKS,
        blogPosts: DEFAULT_BLOGS,
        resources: DEFAULT_RESOURCES,
        orders: [],
        subscribers: [],
        downloads: [],
        users: [
          {
            id: "guest-user",
            name: "Anaya Family Guest",
            email: "otoofredanaaayorkor@gmail.com",
            wishlist: [],
            purchasedBooks: ["anayas-first-prayer"],
            createdAt: new Date().toISOString()
          }
        ],
        reviews: [
          {
            id: "review-1",
            bookId: "anayas-first-prayer",
            userName: "Sarah M.",
            rating: 5,
            comment: "My 4-year-old daughter asks for this book every single night! The illustration style is so warm, and it has genuinely helped her say her own sweet prayers.",
            createdAt: "2026-06-20T08:00:00Z"
          },
          {
            id: "review-2",
            bookId: "the-brave-shepherd",
            userName: "Pastor Thomas",
            rating: 5,
            comment: "An exceptional storytelling resource. I've recommended Caleb's story to several parents in my congregation who are dealing with childhood anxiety. Simple and true to scripture.",
            createdAt: "2026-06-28T12:00:00Z"
          }
        ]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content) as DBStructure;
  } catch (err) {
    console.error("Error reading database file, returning defaults", err);
    return {
      books: DEFAULT_BOOKS,
      blogPosts: DEFAULT_BLOGS,
      resources: DEFAULT_RESOURCES,
      orders: [],
      subscribers: [],
      downloads: [],
      users: [],
      reviews: []
    };
  }
}

function writeDB(data: DBStructure): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

export const db = {
  // BOOKS
  getBooks: () => readDB().books,
  getBookById: (id: string) => readDB().books.find((b) => b.id === id),
  addBook: (book: Book) => {
    const data = readDB();
    data.books.push(book);
    writeDB(data);
    return book;
  },
  updateBook: (id: string, updatedBook: Partial<Book>) => {
    const data = readDB();
    const idx = data.books.findIndex((b) => b.id === id);
    if (idx !== -1) {
      data.books[idx] = { ...data.books[idx], ...updatedBook };
      writeDB(data);
      return data.books[idx];
    }
    return null;
  },
  deleteBook: (id: string) => {
    const data = readDB();
    data.books = data.books.filter((b) => b.id !== id);
    writeDB(data);
    return true;
  },

  // BLOG POSTS
  getBlogs: () => readDB().blogPosts,
  getBlogById: (id: string) => readDB().blogPosts.find((b) => b.id === id),
  addBlogPost: (post: BlogPost) => {
    const data = readDB();
    data.blogPosts.push(post);
    writeDB(data);
    return post;
  },
  updateBlogPost: (id: string, updatedPost: Partial<BlogPost>) => {
    const data = readDB();
    const idx = data.blogPosts.findIndex((b) => b.id === id);
    if (idx !== -1) {
      data.blogPosts[idx] = { ...data.blogPosts[idx], ...updatedPost };
      writeDB(data);
      return data.blogPosts[idx];
    }
    return null;
  },
  deleteBlogPost: (id: string) => {
    const data = readDB();
    data.blogPosts = data.blogPosts.filter((b) => b.id !== id);
    writeDB(data);
    return true;
  },

  // RESOURCES
  getResources: () => readDB().resources,
  getResourceById: (id: string) => readDB().resources.find((r) => r.id === id),
  addResource: (resource: PrintableResource) => {
    const data = readDB();
    data.resources.push(resource);
    writeDB(data);
    return resource;
  },
  updateResource: (id: string, resource: Partial<PrintableResource>) => {
    const data = readDB();
    const idx = data.resources.findIndex((r) => r.id === id);
    if (idx !== -1) {
      data.resources[idx] = { ...data.resources[idx], ...resource };
      writeDB(data);
      return data.resources[idx];
    }
    return null;
  },
  deleteResource: (id: string) => {
    const data = readDB();
    data.resources = data.resources.filter((r) => r.id !== id);
    writeDB(data);
    return true;
  },
  incrementResourceDownload: (id: string) => {
    const data = readDB();
    const r = data.resources.find((res) => res.id === id);
    if (r) {
      r.downloadCount++;
      writeDB(data);
      return r;
    }
    return null;
  },

  // ORDERS
  getOrders: () => readDB().orders,
  getOrderById: (id: string) => readDB().orders.find((o) => o.id === id),
  addOrder: (order: Order) => {
    const data = readDB();
    data.orders.push(order);
    writeDB(data);
    return order;
  },
  updateOrderStatus: (id: string, status: "pending" | "shipped" | "delivered" | "canceled") => {
    const data = readDB();
    const o = data.orders.find((ord) => ord.id === id);
    if (o) {
      o.status = status;
      writeDB(data);
      return o;
    }
    return null;
  },

  // NEWSLETTER
  getSubscribers: () => readDB().subscribers,
  addSubscriber: (email: string) => {
    const data = readDB();
    if (data.subscribers.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
      return null;
    }
    const sub: NewsletterSubscriber = {
      id: "sub-" + Math.random().toString(36).substr(2, 9),
      email,
      status: "active",
      createdAt: new Date().toISOString()
    };
    data.subscribers.push(sub);
    writeDB(data);
    return sub;
  },

  // GATED DOWNLOADS TRACKER
  addGatedDownload: (email: string, resourceId: string, resourceTitle: string) => {
    const data = readDB();
    const download: GatedDownload = {
      id: "dl-" + Math.random().toString(36).substr(2, 9),
      email,
      resourceId,
      resourceTitle,
      createdAt: new Date().toISOString()
    };
    data.downloads.push(download);
    writeDB(data);
    return download;
  },
  getGatedDownloads: () => readDB().downloads,

  // USERS (WISHLIST & PURCHASES)
  getUsers: () => readDB().users,
  getUserByEmail: (email: string) => {
    const data = readDB();
    let u = data.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (!u) {
      u = {
        id: "usr-" + Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0],
        email: email,
        wishlist: [],
        purchasedBooks: ["anayas-first-prayer"], // Pre-grant free starter access
        createdAt: new Date().toISOString()
      };
      data.users.push(u);
      writeDB(data);
    }
    return u;
  },
  toggleWishlist: (email: string, bookId: string) => {
    const data = readDB();
    const u = data.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (u) {
      const idx = u.wishlist.indexOf(bookId);
      if (idx !== -1) {
        u.wishlist.splice(idx, 1);
      } else {
        u.wishlist.push(bookId);
      }
      writeDB(data);
      return u;
    }
    return null;
  },
  grantPurchaseAccess: (email: string, bookIds: string[]) => {
    const data = readDB();
    const u = data.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (u) {
      bookIds.forEach((id) => {
        if (!u.purchasedBooks.includes(id)) {
          u.purchasedBooks.push(id);
        }
      });
      writeDB(data);
      return u;
    }
    return null;
  },

  // REVIEWS
  getReviewsByBook: (bookId: string) => readDB().reviews.filter((r) => r.bookId === bookId),
  addReview: (review: Review) => {
    const data = readDB();
    data.reviews.push(review);
    writeDB(data);
    return review;
  }
};
