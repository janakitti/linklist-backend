const Joi = require('joi');
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 15
    },
    url: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1000
    },
    list: {
        type: mongoose.Schema.Types.ObjectId
    }
});

const Link = mongoose.model('Link', linkSchema);

function validateLink(link) {
    const schema = Joi.object({
        label: Joi.string().min(3).max(15).required(),
        url: Joi.string().min(5).max(1000).required(),
    });
    return schema.validate(link);
}

exports.linkSchema = linkSchema;
exports.Link = Link;
exports.validate = validateLink;