const express = require("express");
require("dotenv").config();
const app = express();

require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/prod")(app);

const port = process.env.PORT || 4000;
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
