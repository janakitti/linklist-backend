const express = require("express");
const users = require("../routes/users");
const lists = require("../routes/lists");
const links = require("../routes/links");
const publicLists = require("../routes/public-lists");
const auth = require("../routes/auth");
const cors = require("cors");

module.exports = function (app) {
  app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/lists", lists);
  app.use("/api/links", links);
  app.use("/api/l", publicLists);
  app.use("/api/auth", auth);
};
