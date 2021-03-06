const auth = require("../middleware/auth");
const { List, validate } = require("../models/list");
const { PublicList } = require("../models/public-list");
const { Link } = require("../models/link");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser")();

router.get("/", [cookieParser, auth], async (req, res) => {
  const lists = await List.find({ owner: req.user._id });
  if (!lists) return res.status(400).send("Attempted to get nonexistent list.");
  res.send(lists);
});

router.post("/", [cookieParser, auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let newList = new List({
    name: req.body.name,
    links: [],
    owner: req.user._id,
    publicListId: undefined,
    isPublished: false,
  });
  newList = await newList.save();

  let user = await User.findById(req.user._id);
  if (!user)
    return res
      .status(400)
      .send("Attempted to create new list under nonexistent user.");

  user.lists.push(newList._id);
  await user.save();

  res.send(newList);
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const list = await List.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, isPublished: false },
    {
      new: true,
    }
  );
  if (!list) return res.status(404).send(`List ${req.params.id} not found.`);

  res.send(list);
});

router.delete("/:id", [cookieParser, auth], async (req, res) => {
  const list = await List.findOne({ _id: req.params.id, owner: req.user._id });
  if (!list) return res.status(404).send(`List ${req.params.id} not found.`);

  let user = await User.findById(req.user._id);
  if (!user)
    return res
      .status(400)
      .send("Attempted to delete new list beloning to nonexistent user.");

  const index = user.lists.indexOf(req.params.id);

  if (list.publicListId) {
    const publicList = await PublicList.findById(list.publicListId);
    if (!publicList)
      return res
        .status(404)
        .send(`Public list ${list.publicListId} not found.`);
    await publicList.remove();
  }

  for (const link of list.links) {
    await Link.findByIdAndDelete(link);
  }

  user.lists.splice(index, 1);

  await user.save();
  await list.remove();

  res.send(list);
});

module.exports = router;
