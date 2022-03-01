const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { sendCode } = require("../util/sendCode");
const { User, validateUser } = require("../models/user");
const { UserAuth, validateAuth } = require("../models/userAuth");

router.get("/", [auth, admin], async (req, res) => {
  const user = await User.find();
  res.send(user);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ phoneNumber: req.body.phoneNumber });
  if (user) return res.status(400).send("User already registered.");

  sendCode(req, res);

  //user = new User(_.pick(req.body, ["phoneNumber"]));
  //const salt = await bcrypt.genSalt(10);
  //user.password = await bcrypt.hash(user.password, salt);
  //await user.save();

  //const token = user.generateAuthToken();
  //res
  //  .header("x-auth-token", token)
  // .send(_.pick(user, ["_id", "name", "email"]));
});

router.post("/auth", validate(validateAuth), async (req, res) => {
  let user = await UserAuth.findOne({ phoneNumber: req.body.phoneNumber });
  if (!user) return res.status(400).send("no auth code");

  if (user.code !== req.body.code) return res.status(501).send("code is wrong");

  let newUser = await User.findOne({ phoneNumber: req.body.phoneNumber });
  if (newUser) return res.status(400).send("User already registered.");

  newUser = new User(_.pick(req.body, ["phoneNumber"]));
  newUser.isAdmin = req.body.isAdmin;
  await newUser.save();

  const token = newUser.generateAuthToken();
  await user.remove();
  res.header("x-auth-token", token).send(user);
});

//router.delete("/:id", validateObjectId, (req, res) => {
//  const user = await User.findByIdAndRemove(req.params.id);

//  if (!user)
//    return res.status(404).send("The user with the given ID was not found.");

//  res.send(user);
//});

router.put(
  "/:id",
  [validateObjectId, validate(validateUser), auth],
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName: req.body.fullName,
        email: req.body.email,
        location: {
          postal_code: req.body.postal_code,
          address: req.body.address,
          city: req.body.city,
          townShip: req.body.townShip,
        },
        isAdmin: req.body.isAdmin,
      },
      {
        new: true,
      }
    );

    if (!user)
      return res.status(404).send("The user with the given ID was not found.");

    res.send(user);
  }
);

module.exports = router;
