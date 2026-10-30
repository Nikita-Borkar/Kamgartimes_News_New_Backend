const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Poll = require("../models/Poll");
const User = require("../models/User");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = (await User.findOne({ role: "admin" })) || (await User.findOne({}));
  await Poll.findOneAndUpdate(
    { question: "काय कामगारांचे किमान वेतन महागाई निर्देशांकानुसार दरवर्षी वाढवायला हवे?" },
    {
      $set: {
        question: "काय कामगारांचे किमान वेतन महागाई निर्देशांकानुसार दरवर्षी वाढवायला हवे?",
        options: [
          { text: "होय, पूर्णपणे आवश्यक", votes: 340 },
          { text: "नाही, उद्योगांवर भार पडेल", votes: 85 },
          { text: "सांगता येत नाही", votes: 55 },
        ],
        totalVotes: 480,
        isActive: true,
        createdBy: admin._id,
      },
    },
    { upsert: true }
  );
  console.log("Seeded active poll successfully!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
