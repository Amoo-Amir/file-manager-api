const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "File must have an owner"],
      index: true,
    },

    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
      maxlength: [255, "Filename cannot exceed 255 characters"],
    },

    filename: {
      type: String,
      required: [true, "Stored filename is required"],
      unique: true,
    },

    path: {
      type: String,
      required: [true, "File path is required"],
    },

    mimetype: {
      type: String,
      required: [true, "File mimetype is required"],
    },

    size: {
      type: Number,
      required: [true, "File size is required"],
      min: [1, "File size must be greater than 0"],
    },

    category: {
      type: String,
      enum: ["image", "document", "archive", "other"],
      default: "other",
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);


fileSchema.pre("save", function (next) {
  if (this.mimetype.startsWith("image/")) {
    this.category = "image";
  } else if (
    this.mimetype === "application/pdf" ||
    this.mimetype === "text/plain"
  ) {
    this.category = "document";
  } else if (
    this.mimetype === "application/zip" ||
    this.mimetype === "application/x-rar-compressed"
  ) {
    this.category = "archive";
  } else {
    this.category = "other";
  }
  
});



// ✅ درست — فقط روی find اعمال کن، نه findOne
fileSchema.pre("find", function (next) {
  this.where({ isDeleted: false });

});

fileSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model("File", fileSchema);