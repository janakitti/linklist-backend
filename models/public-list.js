const Joi = require("joi");
const mongoose = require("mongoose");
const {
  listMin,
  listMax,
  labelMin,
  labelMax,
  urlMin,
  urlMax,
} = require("../utils/constants.js");

const publicListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: listMin,
    maxlength: listMax,
  },
  links: {
    type: [
      {
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
      },
    ],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
  },
  privateListId: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

const PublicList = mongoose.model("PublicList", publicListSchema);

function validatePublicList(publicList) {
  const schema = Joi.object({
    name: Joi.string().min(listMin).max(listMax).required(),
    links: Joi.array().items(
      Joi.object({
        label: Joi.string().min(labelMin).max(labelMax).required(),
        url: Joi.string().min(urlMin).max(urlMax).required(),
      })
    ),
  });
  return schema.validate(publicList);
}

exports.publicListSchema = publicListSchema;
exports.PublicList = PublicList;
exports.validate = validatePublicList;
