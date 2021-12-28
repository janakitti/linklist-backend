const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const {
  fieldMin,
  fieldMax,
  passwordMin,
  passwordMax,
} = require("../utils/constants.js");

router.post("/", async (req, res) => {
  // Validate request
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if user is not yet registered
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  // Validate password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();

  res.cookie("token", token, {
    httpOnly: true,
    // sameSite: "none",
    // secure: true,
  });
  res.send({ token });
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(fieldMin).max(fieldMax).email().required(),
    password: Joi.string().min(passwordMin).max(passwordMax).required(),
  });
  return schema.validate(req);
}

module.exports = router;
