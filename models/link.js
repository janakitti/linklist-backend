const Joi = require("joi");
const mongoose = require("mongoose");
const {
  labelMin,
  labelMax,
  urlMin,
  urlMax,
  listMax,
} = require("../utils/constants.js");

const linkSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    minlength: labelMin,
    maxlength: labelMax,
  },
  url: {
    type: String,
    required: true,
    minlength: urlMin,
    maxlength: urlMax,
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

const Link = mongoose.model("Link", linkSchema);

function validateLink(link) {
  const schema = Joi.object({
    label: Joi.string().min(labelMin).max(labelMax).required(),
    url: Joi.string().min(urlMin).max(urlMax).required(),
  });
  return schema.validate(link);
}

exports.linkSchema = linkSchema;
exports.Link = Link;
exports.validate = validateLink;
