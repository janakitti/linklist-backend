const express = require('express');
const users = require('../routes/users');
const lists = require('../routes/lists');

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/users', users);
    app.use('/api/lists', lists);
}