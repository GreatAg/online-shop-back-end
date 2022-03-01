const mongoose = require("mongoose");
const Joi = require("joi");

const AuthSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    maxlength: 11,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    maxlength: 5,
  },
  messageid: {
    type: String,
    minlength: 1,
    maxlength: 1024,
    required: true,
    unique: true,
  },
});

const UserAuth = mongoose.model("userAuth", AuthSchema);

function validateAuth(user) {
  const schema = Joi.object({
    phoneNumber: Joi.string().max(11).required(),
    code: Joi.string().max(5).required(),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(user);
}

exports.UserAuth = UserAuth;
exports.validateAuth = validateAuth;
