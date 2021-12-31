const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser")();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

router.get("/me", [cookieParser, auth], async (req, res) => {
  // Select all but the password to send back in response
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  // Validate request
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if user is already registered
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  // Create new user object
  user = new User(_.pick(req.body, ["username", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();

  const OAuth2 = google.auth.OAuth2;

  // Connect Linklist application to Google OAuth playground
  const oauth2Client = new OAuth2(
    process.env.OAUTH_CLIENTID,
    process.env.OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  // Renew access token using refresh token
  oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token " + err);
      }
      resolve(token);
    });
  });

  // Authenticate as owner of the Gmail account
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USERNAME,
      accessToken,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });

  // Create email
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: user.email,
    subject: "Welcome to Linklist!",
    html: `Please <a href="">click here</a> to verify your email.`,
  };

  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Confirmation email sent successfuly.");
    }
  });

  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "username", "email"]));
});

module.exports = router;
