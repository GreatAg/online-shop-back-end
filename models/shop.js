const mongoose = require("mongoose");
const Joi = require("Joi");
Joi.objectId = require("joi-objectid")(Joi);

const shopSchema = new mongoose.Schema({
  item: {
    type: new mongoose.Schema({
      type: {
        name: {
          type: String,
          minlength: 3,
          maxlength: 50,
          required: true,
        },
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
      size: {
        type: String,
        minlength: 3,
        maxlength: 50,
      },
      price: {
        type: Number,
        min: 0,
        required: true,
      },
    }),
    required: true,
  },
  user: {
    type: new mongoose.Schema({
      phoneNumber: {
        type: String,
        required: true,
        maxlength: 11,
      },
      fullName: {
        type: String,
        minlength: 5,
        maxlength: 50,
      },
    }),
    required: true,
  },
  isfinish: {
    type: Boolean,
    required: true,
    default: false,
  },
  trackingCode: {
    type: String,
    minlength: 5,
    maxlength: 15,
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dateShop: {
    type: Date,
  },
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const Shop = mongoose.model("Shop", shopSchema);

function validateShop(shop) {
  const schema = Joi.object({
    userId: Joi.objectId().required(),
    itemId: Joi.objectId().required(),
  });

  return schema.validate(shop);
}

exports.Shop = Shop;
exports.validateShop = validateShop;
