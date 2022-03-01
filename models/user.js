const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    minlength: 5,
    unique: true,
    require: true,
    index: true,
    unique: true,
    sparse: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    maxlength: 11,
  },
  location: {
    type: new mongoose.Schema({
      postal_code: {
        type: String,
        trim: true,
        minlength: 5,
        maxlength: 50,
      },
      address: {
        type: String,
        minlength: 0,
        maxlength: 2048,
      },
      city: {
        type: String,
        minlength: 0,
        maxlength: 100,
      },
      townShip: {
        type: String,
        minlength: 0,
        maxlength: 100,
      },
    }),
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

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
    //    {
    //      expiresIn: "5h",
    //    }
  );
  return token;
};

const User = mongoose.model("user", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50),
    email: Joi.string().min(5).max(255).email(),
    phoneNumber: Joi.string().max(11),
    postal_code: Joi.string().min(5).max(50),
    address: Joi.string().min(0).max(2048),
    city: Joi.string().min(0).max(100),
    townShip: Joi.string().min(0).max(100),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
