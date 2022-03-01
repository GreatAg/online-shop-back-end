const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { Admin, validateAdmin } = require("../models/admin");
const bcrypt = require("bcrypt");

router.get("/", [auth, admin], async (req, res) => {
  const user = await Admin.find();
  res.send(user);
});

router.get("/me", auth, async (req, res) => {
  const user = await Admin.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/signup", validate(validateAdmin), async (req, res) => {
  let user = await Admin.findOne({ username: req.body.username });
  if (user) return res.status(400).send("Admin already registered.");

  user = new Admin(_.pick(req.body, ["fullName", "username", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "fullName", "username"]));
});

router.post("/login", validate(validateAdmin), async (req, res) => {
  let user = await Admin.findOne({ username: req.body.username });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.send(token);
});

module.exports = router;
