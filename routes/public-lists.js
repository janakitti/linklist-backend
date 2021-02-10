const auth = require("../middleware/auth");
const { PublicList, validate } = require("../models/public-list");
const { User } = require("../models/user");
const { List } = require("../models/list");
const { Link } = require("../models/link");
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser")();

router.get("/:id", async (req, res) => {
  try {
    let publicList = await PublicList.findById(req.params.id);
    if (!publicList) return res.status(404).send("List not found.");
    res.send(publicList);
  } catch (err) {
    res.status(404).send("List not found.");
  }
});

router.post("/:id", [cookieParser, auth], async (req, res) => {
  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  let list = await List.findById(req.params.id);
  if (!list)
    return res.status(400).send("Attempted to publish nonexistent list.");

  const getLinks = async () => {
    return Promise.all(list.links.map((link) => Link.findById(link)));
  };

  let links = await getLinks();

  let newPublicList = new PublicList({
    name: list.name,
    links: links,
    owner: list.owner,
    privateListId: req.params.id,
  });

  let user = await User.findById(newPublicList.owner);
  if (!user)
    return res
      .status(400)
      .send("Attempted to create new public list under invalid user.");

  if (req.user._id != newPublicList.owner)
    return res.status(403).send("User does not own list.");

  newPublicList = await newPublicList.save();

  list.publicListId = newPublicList._id;
  list.isPublished = true;

  await list.save();

  res.send(newPublicList);
});

router.put("/:id", [cookieParser, auth], async (req, res) => {
  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  let list = await List.findById(req.params.id);
  if (!list)
    return res.status(400).send("Attempted to publish nonexistent list.");

  let publicList = await PublicList.findById(list.publicListId);
  if (!publicList)
    return res.status(404).send(`Public list ${list.publicListId} not found.`);

  if (req.user._id != publicList.owner)
    return res.status(400).send("Attempted to update an unowned public list.");

  const getLinks = async () => {
    return Promise.all(list.links.map((link) => Link.findById(link)));
  };

  publicList.name = list.name;
  publicList.links = await getLinks();

  publicList = await publicList.save();

  res.send(publicList);
});

router.delete("/:id", [cookieParser, auth], async (req, res) => {
  const publicList = await PublicList.findById(req.params.id);
  if (!publicList)
    return res.status(404).send(`List ${req.params.id} not found.`);

  if (req.user._id != publicList.owner)
    return res.status(400).send("Attempted to delete an unowned public list.");

  await publicList.remove();

  res.send(publicList);
});

module.exports = router;
