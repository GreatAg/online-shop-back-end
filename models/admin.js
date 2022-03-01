const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
    require: true,
  },
  username: {
    type: String,
    minlength: 4,
    required: true,
    unique: true,
    maxlength: 11,
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

adminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
    //    {
    //      expiresIn: "5h",
    //    }
  );
  return token;
};

const Admin = mongoose.model("admin", adminSchema);

function validateAdmin(user) {
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50),
    username: Joi.string().min(4).max(40).required(),
    password: Joi.string().min(5).max(1024).required(),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(user);
}

exports.Admin = Admin;
exports.validateAdmin = validateAdmin;
