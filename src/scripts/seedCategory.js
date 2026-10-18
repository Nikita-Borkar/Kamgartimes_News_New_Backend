const mongoose = require("mongoose");
const Category = require("../models/Category"); // Update path if needed
const dotenv = require("dotenv");

dotenv.config();

const navItems = [
  {
    name: "होम",
    slug: "home",
    children: [
      { name: "मुख्य बातमी", slug: "lead-news" },
      { name: "ताजी अपडेट्स", slug: "latest-news" },
      { name: "ट्रेंडिंग", slug: "trending" },
    ],
  },
  {
    name: "कामगार टाइम्स",
    slug: "labor",
    children: [
      { name: "कामगार हक्क", slug: "labor-rights" },
      { name: "युनियन न्यूज", slug: "labor-union" },
      { name: "वेतन व भत्ते", slug: "wages" },
      { name: "कायदे व नियम", slug: "labor-laws" },
    ],
  },
  {
    name: "लोकल न्यूज़",
    slug: "city",
    children: [
      { name: "नागपूर शहर", slug: "nagpur" },
      { name: "चंद्रपूर", slug: "chandrapur" },
      { name: "वर्धा", slug: "wardha" },
      { name: "अमरावती", slug: "amravati" },
      { name: "गोंदिया", slug: "gondia" },
    ],
  },
  {
    name: "लेटेस्ट न्युज",
    slug: "latest",
    children: [
      { name: "ताजी घडामोडी", slug: "breaking" },
      { name: "महाराष्ट्र", slug: "maharashtra" },
      { name: "देश", slug: "national" },
      { name: "आंतरराष्ट्रीय", slug: "world" },
    ],
  },
  {
    name: "गुन्हेवार्ता",
    slug: "crime",
    children: [
      { name: "पोलीस कारवाई", slug: "police-action" },
      { name: "सायबर गुन्हे", slug: "cyber-crime" },
      { name: "न्यायालयीन निकाल", slug: "court-news" },
      { name: "विशेष तपास", slug: "investigation" },
    ],
  },
  {
    name: "संपादकीय",
    slug: "editorial",
    children: [
      { name: "अग्रलेख", slug: "editorial-article" },
      { name: "मंथन", slug: "manthan" },
      { name: "विचारपीठ", slug: "opinion" },
      { name: "वाचकांचे मत", slug: "readers-view" },
    ],
  },
  {
    name: "लक्षवेधी",
    slug: "featured",
    children: [
      { name: "विशेष रिपोर्ट", slug: "special-report" },
      { name: "स्टोरी ऑफ द डे", slug: "story-of-day" },
      { name: "खास मुलाखत", slug: "interview" },
    ],
  },
  {
    name: "सरकारी नोकरी",
    slug: "jobs",
    children: [
      { name: "MPSC / UPSC भरती", slug: "mpsc-upsc" },
      { name: "पोलीस भरती", slug: "police-jobs" },
      { name: "रेल्वे भरती", slug: "railway-jobs" },
      { name: "बँकिंग भरती", slug: "bank-jobs" },
    ],
  },
  {
    name: "मनोरंजन",
    slug: "entertainment",
    children: [
      { name: "बॉलिवूड", slug: "bollywood" },
      { name: "मराठी चित्रपट", slug: "marathi-cinema" },
      { name: "ओटीटी", slug: "ott" },
      { name: "टीव्ही मालिका", slug: "tv-shows" },
    ],
  },
  {
    name: "राजनीती",
    slug: "politics",
    children: [
      { name: "महाराष्ट्र राजकारण", slug: "maharashtra-politics" },
      { name: "राष्ट्रीय राजकारण", slug: "national-politics" },
      { name: "निवडणूक विशेष", slug: "election" },
    ],
  },
  {
    name: "क्रीडा",
    slug: "sports",
    children: [
      { name: "क्रिकेट", slug: "cricket" },
      { name: "आयपीएल", slug: "ipl" },
      { name: "फुटबॉल", slug: "football" },
      { name: "कबड्डी", slug: "kabaddi" },
    ],
  },
  {
    name: "ब्रह्मांड",
    slug: "space",
    children: [
      { name: "खगोलशास्त्र", slug: "astronomy" },
      { name: "अंतराळ मोहीम", slug: "space-missions" },
      { name: "रहस्यमय विज्ञान", slug: "science" },
    ],
  },
  {
    name: "ई-पेपर",
    slug: "e-paper",
  },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    for (const item of navItems) {
      // Find or create the parent category
      let parent = await Category.findOneAndUpdate(
        { slug: item.slug },
        {
          $set: {
            name: item.name,
            isActive: true,
            parent: null,
          },
          $setOnInsert: { slug: item.slug },
        },
        { upsert: true, new: true, runValidators: true },
      );

      console.log(`Parent: ${parent.name}`);

      // Find or create child categories
      if (item.children?.length) {
        for (const child of item.children) {
          await Category.findOneAndUpdate(
            { slug: child.slug },
            {
              $set: {
                name: child.name,
                parent: parent._id,
                isActive: true,
              },
              $setOnInsert: { slug: child.slug },
            },
            { upsert: true, new: true, runValidators: true },
          );
        }
      }
    }

    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedCategories();
