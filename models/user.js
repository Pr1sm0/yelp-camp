const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose"),
      passport              = require("passport");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: String,
    isPaid: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);