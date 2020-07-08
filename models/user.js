const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose"),
      passport              = require("passport");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);