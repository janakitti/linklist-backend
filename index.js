const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     next();
//   });
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// app.options('*', cors());

require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/prod")(app);

const port = process.env.PORT || 4000;
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
