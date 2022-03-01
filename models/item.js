const Joi = require("joi");
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  type: {
    type: new mongoose.Schema({
      name: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true,
      },
    }),
    required: true,
  },
  name: {
    type: String,
    minlength: 3,
    maxlength: 1024,
    required: true,
  },
  color: {
    type: String,
    minlength: 3,
    maxlength: 100,
  },
  isAvailable: {
    type: Boolean,
    required: true,
  },
  size: {
    type: String,
    minlength: 0,
    maxlength: 200,
  },
  price: {
    type: Number,
    min: 0,
    required: function () {
      return this.isAvailable;
    },
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now,
  },
  off: {
    type: Number,
  },
  offPrice: {
    type: Number,
    default: function () {
      if (this.off) {
        return (this.price * (100 - this.off)) / 100;
      } else return 0;
    },
  },
  img: [
    {
      type: new mongoose.Schema({
        data: Buffer,
        contentType: String,
      }),
    },
  ],
});

const Item = mongoose.model("Item", itemSchema);

function validateItem(item) {
  const schema = Joi.object({
    typeId: Joi.objectId().required(),
    name: Joi.string().min(3).max(1024).required(),
    isAvailable: Joi.boolean().required(),
    color: Joi.string().min(3).max(100).required(),
    size: Joi.string().min(0).max(200),
    off: Joi.number().min(0),
    price: Joi.number().min(0).required(),
  });
  return schema.validate(item);
}

exports.Item = Item;
exports.validateItem = validateItem;
