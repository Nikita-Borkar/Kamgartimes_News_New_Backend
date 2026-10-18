const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Section name is required"],
      trim: true,
      unique: true,
    },

    altText: {
      type: String,
      trim: true,
      default: "",
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Category = mongoose.model("Section", categorySchema);

module.exports = Category;
