const auth = require('../middleware/auth');
const { List, validate } = require('../models/list');
const { User } = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let newList = new List({ name: req.body.name, links: [], owner: req.user._id });
    newList = await newList.save();

    let user = await User.findById(req.user._id);
    user.lists.push(newList._id);
    await user.save();

    res.send(newList);
});

module.exports = router;
