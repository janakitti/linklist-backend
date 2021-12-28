const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const { fieldMin, fieldMax, usernameMin, usernameMax, passwordMin, passwordMax } = require("../utils/constants.js");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: usernameMin,
    maxlength: usernameMax,
  },
  email: {
    type: String,
    required: true,
    minlength: fieldMin,
    maxlength: fieldMax,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: passwordMin,
    maxlength: passwordMax,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  lists: {
    type: [mongoose.Schema.Types.ObjectId],
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"));
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(usernameMin).max(usernameMax).required(),
    email: Joi.string().min(fieldMin).max(fieldMax).email().required(),
    password: Joi.string().min(fieldMin).max(fieldMax).required(),
  });
  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
