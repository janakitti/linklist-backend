const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser")();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const generateHash = (s) => {
  var hash = 0,
    i,
    chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
  }
  return hash;
};

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

  let verificationCode = generateHash(req.body.email);

  // Create new user object
  user = new User({
    ..._.pick(req.body, ["username", "email", "password"]),
    verificationCode,
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  console.log(user);

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
    html: `Please <a href="${process.env.ORIGIN}/verify?id=${verificationCode}">click here</a> to verify your email.`,
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

router.post("/verify/:verificationCode", async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });
  if (user) {
    user.isVerified = true;
    await user.save();
    res.send(user);
  } else {
    res.status(400).send("Invalid verification code.");
  }
});

module.exports = router;
