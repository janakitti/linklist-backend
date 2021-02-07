const auth = require("../middleware/auth");
const { PublicList, validate } = require("../models/public-list");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser")();

router.get("/:id", async (req, res) => {
  let publicList = await PublicList.findById(req.params.id);
  if (!publicList) return res.status(404).send("List not found.");
  res.send(publicList);
});

router.post("/", [cookieParser, auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let newPublicList = new PublicList({
    name: req.body.name,
    links: req.body.links,
    owner: req.user._id,
  });

  let user = await User.findById(newPublicList.owner);
  if (!user)
    return res
      .status(400)
      .send("Attempted to create new public list under invalid user.");

  newPublicList = await newPublicList.save();

  res.send(newPublicList);
});

router.put("/:id", [cookieParser, auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let publicList = await PublicList.findById(req.params.id);
  if (!publicList)
    return res.status(404).send(`Public list ${req.params.id} not found.`);

  if (req.user._id != publicList.owner)
    return res.status(400).send("Attempted to update an unowned public list.");

  publicList.label = req.body.name;
  publicList.url = req.body.links;

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
