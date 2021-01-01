const express = require('express');
const users = require('../routes/users');
const lists = require('../routes/lists');
const links = require('../routes/links');
const auth = require('../routes/auth');

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/users', users);
    app.use('/api/lists', lists);
    app.use('/api/links', links);
    app.use('/api/auth', auth);
}