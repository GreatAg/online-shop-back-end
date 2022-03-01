const Joi = require("joi");
const _ = require("lodash");
const { User } = require("../models/user");
const { UserAuth, validateAuth } = require("../models/userAuth");
const express = require("express");
const validate = require("../middleware/validate");
const { sendCode } = require("../util/sendCode");
const router = express.Router();

router.post("/", validate(validator), async (req, res) => {
  let user = await User.findOne({ phoneNumber: req.body.phoneNumber });
  if (!user)
    return res.status(400).send("Invalid phone number or Unregistered.");

  sendCode(req, res);
});

router.post("/login", validate(validateAuth), async (req, res) => {
  let user = await UserAuth.findOne({ phoneNumber: req.body.phoneNumber });
  if (!user) return res.status(400).send("no auth code");

  if (user.code !== req.body.code) return res.status(501).send("code is wrong");

  let logUser = await User.findOne({ phoneNumber: req.body.phoneNumber });
  if (!logUser) return res.status(400).send("User Unregistered.");

  const token = logUser.generateAuthToken();
  await user.remove();
  res.header("x-auth-token", token).send(user);
});

function validator(req) {
  const schema = Joi.object({
    phoneNumber: Joi.string().max(11),
  });

  return schema.validate(req);
}

module.exports = router;
