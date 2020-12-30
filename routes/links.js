const auth = require('../middleware/auth');
const { Link, validate } = require('../models/link');
const { List } = require('../models/list');
const { User } = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/:id', auth, async (req, res) => {
    let list = await List.findById(req.params.id);
    if (!list) return res.status(400).send('Attempted to get link inside nonexistent list.');

    let user = await User.findById(list.owner);
    if (!user) return res.status(400).send('Attempted to get link inside list belonging to nonexistent user.');

    if (req.user._id != list.owner) return res.status(400).send('Attempted to get link in unowned list.');

    const links = await Link.find({ list: req.params.id })

    res.send(links);
});

router.post('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let newLink = new Link({ label: req.body.label, url: req.body.url, list: req.params.id });

    let list = await List.findById(req.params.id);
    if (!list) return res.status(400).send('Attempted to create new link inside nonexistent list.');

    let user = await User.findById(list.owner);
    if (!user) return res.status(400).send('Attempted to create new list inside list belonging to nonexistent user.');

    if (req.user._id != list.owner) return res.status(400).send('Attempted to create new list in unowned list.');

    list.links.push(newLink._id);

    newLink = await newLink.save();
    await list.save();

    res.send(newLink);
});

router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let link = await Link.findById(req.params.id);
    if (!link) return res.status(404).send(`Link ${req.params.id} not found.`);

    let list = await List.findById(link.list);
    if (!list) return res.status(400).send('Attempted to update link inside nonexistent list.');

    let user = await User.findById(list.owner);
    if (!user) return res.status(400).send('Attempted to update link inside list belonging to nonexistent user.');

    if (req.user._id != list.owner) return res.status(400).send('Attempted to update link in unowned list.');
 
    // Update the values in the link and save()
    link.label = req.body.label;
    link.url = req.body.url;
    
    link = await link.save();

    res.send(link);
});

router.delete('/:id', auth, async (req, res) => {
    let link = await Link.findById(req.params.id);
    if (!link) return res.status(404).send(`Link ${req.params.id} not found.`);

    let list = await List.findById(link.list);
    if (!list) return res.status(400).send('Attempted to delete link inside nonexistent list.');

    let user = await User.findById(list.owner);
    if (!user) return res.status(400).send('Attempted to delete link inside list belonging to nonexistent user.');

    if (req.user._id != list.owner) return res.status(400).send('Attempted to delete link in unowned list.');

    const index = list.links.indexOf(req.params.id);
    list.links.splice(index, 1);

    await list.save();
    await link.remove();
    
    res.send(link);
});

module.exports = router;
