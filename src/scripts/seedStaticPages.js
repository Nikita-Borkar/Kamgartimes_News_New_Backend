const mongoose = require("mongoose");
const StaticPage = require("../models/StaticPage");
require("dotenv").config();

const pages = [
  {
    title: "About Us",
    slug: "about-us",
    content:
      "<p>Welcome to Kamgar Times — your trusted source for Hindi news and updates.</p>",
    excerpt: "Learn more about Kamgar Times and our mission.",
    isActive: true,
    showInFooter: true,
    sortOrder: 1,
    seo: {
      metaTitle: "About Us - Kamgar Times",
      metaDescription: "Know about Kamgar Times, a Hindi news platform.",
    },
  },
  {
    title: "Contact Us",
    slug: "contact-us",
    content:
      "<p>Get in touch with the Kamgar Times team. Send us your feedback, news tips, or inquiries.</p>",
    excerpt: "Contact Kamgar Times editorial team.",
    isActive: true,
    showInFooter: true,
    sortOrder: 2,
    seo: {
      metaTitle: "Contact Us - Kamgar Times",
      metaDescription: "Contact Kamgar Times for queries and feedback.",
    },
  },
  {
    title: "Disclaimer",
    slug: "disclaimer",
    content:
      "<p>The content on Kamgar Times is for general informational purposes only.</p>",
    excerpt: "Read our disclaimer.",
    isActive: true,
    showInFooter: true,
    sortOrder: 3,
    seo: {
      metaTitle: "Disclaimer - Kamgar Times",
      metaDescription: "Disclaimer page of Kamgar Times.",
    },
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    content:
      "<p>Your privacy is important to us. Read our privacy policy to understand how we handle your data.</p>",
    excerpt: "Read our privacy policy.",
    isActive: true,
    showInFooter: true,
    sortOrder: 4,
    seo: {
      metaTitle: "Privacy Policy - Kamgar Times",
      metaDescription: "Privacy policy of Kamgar Times.",
    },
  },
  {
    title: "Donate Us",
    slug: "donate-us",
    content:
      "<p>Support Kamgar Times with your donation. Your contribution helps us keep delivering independent Hindi journalism.</p>",
    excerpt: "Donate to support Kamgar Times.",
    isActive: true,
    showInFooter: true,
    sortOrder: 5,
    seo: {
      metaTitle: "Donate Us - Kamgar Times",
      metaDescription: "Donate to Kamgar Times and support independent journalism.",
    },
  },
  {
    title: "Pay for Ads",
    slug: "pay-for-ads",
    content:
      "<p>Advertise with Kamgar Times. Reach our readers across Hindi-speaking regions with our ad placement options.</p>",
    excerpt: "Advertising and payment options.",
    isActive: true,
    showInFooter: true,
    sortOrder: 6,
    seo: {
      metaTitle: "Pay for Ads - Kamgar Times",
      metaDescription: "Advertise on Kamgar Times.",
    },
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/kamgartimes");
    console.log("Connected to MongoDB");

    // Attribute seeded pages to the admin account when it exists
    const User = require("../models/User");
    const admin = await User.findOne({ role: "admin" });

    for (const pageData of pages) {
      const existing = await StaticPage.findOne({ slug: pageData.slug });
      if (existing) {
        console.log(`⏭️  Skipped: ${pageData.slug} (already exists)`);
        continue;
      }
      await StaticPage.create({ ...pageData, createdBy: admin?._id || null, updatedBy: admin?._id || null });
      console.log(`✅ Created: ${pageData.slug}`);
    }

    console.log("\nSeed completed.");
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seed();
