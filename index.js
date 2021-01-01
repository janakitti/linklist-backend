const express = require('express');
const cors = require('cors');
const app = express();
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     next();
//   });
app.use(cors());
app.options('*', cors());

require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();





const port = process.env.PORT || 4000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

module.exports = server;