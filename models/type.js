const Joi = require("joi");
const mongoose = require("mongoose");

const typeSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true,
  },
  icon: {
    type: String,
    minlength: 3,
    maxlength: 1024,
  },
});

const Type = mongoose.model("type", typeSchema);

function validateType(type) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    icon: Joi.string().min(3).max(1024),
  });

  return schema.validate(type);
}

exports.Type = Type;
exports.validateType = validateType;
