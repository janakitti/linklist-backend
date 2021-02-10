const Joi = require("joi");
const mongoose = require("mongoose");

const publicListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 15,
  },
  links: {
    type: [
      {
        label: {
          type: String,
          required: true,
          minlength: 1,
          maxlength: 15,
        },
        url: {
          type: String,
          required: true,
          minlength: 5,
          maxlength: 1000,
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
    name: Joi.string().min(1).max(15).required(),
    links: Joi.array().items(
      Joi.object({
        label: Joi.string().min(3).max(15).required(),
        url: Joi.string().min(5).max(1000).required(),
      })
    ),
  });
  return schema.validate(publicList);
}

exports.publicListSchema = publicListSchema;
exports.PublicList = PublicList;
exports.validate = validatePublicList;
