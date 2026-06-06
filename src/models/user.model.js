const mongoose = require("mongoose");
const { type } = require("node:os");

const userschema = mongoose.Schema({
  fullName: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

userschema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("file manager", userschema);
