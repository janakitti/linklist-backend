const Joi = require('joi');
const mongoose = require('mongoose');
const { linkSchema } = require('./link');

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 15
    },
    links: {
        type: [ linkSchema ]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId
    }
});

const List = mongoose.model('List', listSchema);

function validateList(list) {
    const schema = Joi.object({
        name: Joi.string().min(1).max(15).required()
    });
    return schema.validate(list);
}

exports.listSchema = listSchema;
exports.List = List;
exports.validate = validateList;