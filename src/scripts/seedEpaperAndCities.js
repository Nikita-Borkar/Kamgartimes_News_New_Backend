const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const City = require("../models/City");
const EpaperEdition = require("../models/EpaperEdition");
const User = require("../models/User");

const CITIES = [
  { name: "नागपुर", slug: "nagpur", state: "महाराष्ट्र", description: "उपराजधानी नागपूर व विदर्भ आवृत्ती", order: 1 },
  { name: "मुंबई", slug: "mumbai", state: "महाराष्ट्र", description: "राजधानी मुंबई व कोकण आवृत्ती", order: 2 },
  { name: "पुणे", slug: "pune", state: "महाराष्ट्र", description: "पुणे व पश्चिम महाराष्ट्र आवृत्ती", order: 3 },
  { name: "अमरावती", slug: "amravati", state: "महाराष्ट्र", description: "अमरावती व वऱ्हाड आवृत्ती", order: 4 },
  { name: "चंद्रपुर", slug: "chandrapur", state: "महाराष्ट्र", description: "चंद्रपूर व गडचिरोली औद्योगिक आवृत्ती", order: 5 },
  { name: "नाशिक", slug: "nashik", state: "महाराष्ट्र", description: "उत्तर महाराष्ट्र आवृत्ती", order: 6 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for Epaper & City seeding.");

    const admin = await User.findOne({ role: "admin" }) || await User.findOne({});
    if (!admin) {
      console.error("No user found in DB to attach createdBy!");
      process.exit(1);
    }

    // 1. Upsert Cities
    const cityMap = {};
    for (const c of CITIES) {
      const city = await City.findOneAndUpdate(
        { slug: c.slug },
        { $set: { name: c.name, state: c.state, description: c.description, isActive: true, order: c.order } },
        { upsert: true, new: true }
      );
      cityMap[c.slug] = city._id;
      console.log(`Seeded City: ${city.name} (${city.slug})`);
    }

    // 2. Generate Real Editions for past 7 days across cities
    const today = new Date();
    const editionsData = [];

    // Real Cloudinary & Hosted newspaper images
    const coverImages = [
      "https://res.cloudinary.com/gz38ncde/image/upload/v1792934030/kamgartimes/images/ibkqftbwrf5r8onmdre9.jpg",
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&q=85",
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&q=85",
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&q=85"
    ];

    const pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const edDate = new Date(today);
      edDate.setDate(today.getDate() - dayOffset);
      const dateStr = edDate.toISOString().slice(0, 10);
      const formattedDateHindi = edDate.toLocaleDateString("hi-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      // Nagpur Edition
      editionsData.push({
        title: `कामगार टाइम्स - नागपुर (${formattedDateHindi})`,
        slug: `nagpur-${dateStr}`,
        editionDate: edDate,
        city: cityMap["nagpur"],
        pdfUrl: pdfUrl,
        coverImageUrl: coverImages[dayOffset % coverImages.length],
        pageCount: 8,
        fileSize: "14.8 MB",
        blurb: "दिवाळी विशेषांक व विदर्भ घडामोडी; असंगठित कामगारांच्या किमान वेतनात ऐतिहासिक वाढ; नागपूर विधानसभा आढावा.",
        isActive: true,
        createdBy: admin._id
      });

      // Mumbai Edition
      editionsData.push({
        title: `कामगार टाइम्स - मुंबई (${formattedDateHindi})`,
        slug: `mumbai-${dateStr}`,
        editionDate: edDate,
        city: cityMap["mumbai"],
        pdfUrl: pdfUrl,
        coverImageUrl: coverImages[(dayOffset + 1) % coverImages.length],
        pageCount: 8,
        fileSize: "15.2 MB",
        blurb: "मुंबई महानगर औद्योगिक करार संपन्न; बेस्ट आणि रेल्वे कामगार मागण्या; महायुती व महाविकास आघाडी निवडणूक रणधुमाळी.",
        isActive: true,
        createdBy: admin._id
      });

      // Pune Edition
      if (dayOffset <= 3) {
        editionsData.push({
          title: `कामगार टाइम्स - पुणे (${formattedDateHindi})`,
          slug: `pune-${dateStr}`,
          editionDate: edDate,
          city: cityMap["pune"],
          pdfUrl: pdfUrl,
          coverImageUrl: coverImages[(dayOffset + 2) % coverImages.length],
          pageCount: 8,
          fileSize: "13.9 MB",
          blurb: "पिंपरी-चिंचवड आयटी व ऑटोमोबाईल कामगार विशेष; कंत्राटी कामगारांना बोनस व हक्क.",
          isActive: true,
          createdBy: admin._id
        });
      }
    }

    for (const ed of editionsData) {
      await EpaperEdition.findOneAndUpdate(
        { slug: ed.slug },
        { $set: ed },
        { upsert: true, new: true }
      );
      console.log(`Seeded Edition: ${ed.title} [${ed.slug}]`);
    }

    console.log(`Successfully seeded ${editionsData.length} E-paper editions!`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();
