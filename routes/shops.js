const express = require("express");
const router = express.Router();
const { validateShop, Shop } = require("../models/shop");
const { Item } = require("../models/item");
const { User } = require("../models/user");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const shops = await Shop.find();
  res.send(shops);
});

router.get("/grouped", async (req, res) => {
  const shops = await Shop.find({
    isfinish: true,
  });
  const grouped = groupArrayOfObjects(shops, "trackingCode");
  cluster = [];
  for (let i = 0; i < Object.keys(grouped).length; i++) {
    const obj = {
      trackingCode: Object.keys(grouped)[i],
      items: grouped[Object.keys(grouped)[i]],
    };
    cluster.push(obj);
  }
  res.send(cluster);
});

router.get("/myshops", auth, async (req, res) => {
  const shops = await Shop.find({
    $in: [
      {
        user: {
          _id: req.user._id,
        },
      },
    ],
  });

  if (!shops)
    return res.status(404).send("there is not shop with for this user id.");

  res.send(shops);
});

router.get("/:track", async (req, res) => {
  const shop = await Shop.findById(req.params.track);
  if (!shop)
    return res.status(404).send("the purchase with the given id not found");
  res.send(shop);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop)
    return res.status(404).send("the purchase with the given id not found");

  res.send(shop);
});

router.post("/", [validate(validateShop), auth], async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send("Invalid userId");

  const item = await Item.findById(req.body.itemId);
  if (!item) return res.status(400).send("Invalid itemId");

  let shop = new Shop({
    user: {
      _id: user._id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
    },
    item: {
      _id: item._id,
      type: {
        _id: item.type._id,
        name: item.type.name,
      },
      name: item.name,
      color: item.color,
      size: item.size,
      price: item.price,
    },
  });

  shop = await shop.save();
  res.send(shop);
});

router.post("/purchase", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.userId))
    return res.status(404).send("Invalid ID.");

  const user = await User.findById(req.body.userId);
  if (!user) res.status(400).send("Invalid user");

  const shops = await Shop.find({
    $in: [
      {
        user: {
          _id: req.body.userid,
        },
      },
    ],
  });

  if (!shops) return res.status(404).send("there is not shop with this id.");

  res.send(shops);
});

router.put("/:id", [validateObjectId, auth], async (req, res) => {
  let shop = await Shop.findById(req.params.id);
  if (!shop) res.status(404).send("there is not shop with this id.");

  if (shop.trackingCode) {
    shop.isfinish = true;
    shop.trackingCode = req.body.trackingCode;
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + " " + time;
    shop.dateShop = dateTime;
  }

  shop.status = req.body.status;

  shop = await shop.save();
  res.send(shop);
});

router.delete("/:id", [validateObjectId, auth], async (req, res) => {
  const shop = await Shop.findByIdAndRemove(req.params.id);

  if (!shop)
    return res.status(404).send("The shop with the given ID not found.");

  res.send(shop);
});

function groupArrayOfObjects(list, key) {
  return list.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

module.exports = router;
