const Joi = require("joi");
const mongoose = require("mongoose");
const { listMin, listMax } = require("../utils/constants.js");

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: listMin,
    maxlength: listMax,
  },
  links: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
  },
  publicListId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  isPublished: {
    type: Boolean,
  },
});

const List = mongoose.model("List", listSchema);

function validateList(list) {
  const schema = Joi.object({
    name: Joi.string().min(listMin).max(listMax).required(),
  });
  return schema.validate(list);
}

exports.listSchema = listSchema;
exports.List = List;
exports.validate = validateList;
