const express = require("express");
const Joi = require("joi");
const router = express.Router();
const { validateItem, Item } = require("../models/item");
const { Type } = require("../models/type");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });
router.use(express.static(__dirname));

router.get("/", async (req, res) => {
  const items = await Item.find();
  res.send(items);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item)
    return res.status(404).send("the item with the given id not found");

  res.send(item);
});

router.post(
  "/",
  [upload.array("images"), validate(validateItem), auth],
  async (req, res) => {
    console.log(req.body);
    const type = await Type.findById(req.body.typeId);
    if (!type) res.status(400).send("Invalid type");

    const images = [];
    for (let index = 0; index < req.files.length; index++) {
      img = {
        data: fs.readFileSync(
          path.join(__dirname + "/uploads/" + req.files[index].filename)
        ),
        contentType: req.files[index].mimetype,
      };

      images.push(img);
    }
    let item = new Item({
      type: {
        _id: type._id,
        name: type.name,
      },
      isAvailable: req.body.isAvailable,
      name: req.body.name,
      color: req.body.color,
      size: req.body.size,
      price: req.body.price,
      off: req.body.off,
      img: images,
    });

    item = await item.save();
    res.send(item);
  }
);

router.post("/type", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.typeId))
    return res.status(404).send("Invalid ID.");

  const type = await Type.findById(req.body.typeId);
  if (!type) res.status(400).send("Invalid type");

  const items = await Item.find({
    $in: [
      {
        type: {
          _id: req.body.typeId,
        },
      },
    ],
  });

  if (items.length === 0)
    return res.status(404).send("there is not item with this id.");

  res.send(items);
});

router.put(
  "/:id",
  [upload.array("images"), validateObjectId, validate(validator), auth, admin],
  async (req, res) => {
    const type = await Type.findById(req.body.typeId);
    if (!type) res.status(400).send("Invalid type");

    const images = [];
    if (req.files !== undefined) {
      const images = [];
      for (let index = 0; index < req.files.length; index++) {
        images.push({
          data: fs.readFileSync(
            path.join(__dirname + "/uploads/" + req.files[index].filename)
          ),
          contentType: req.files[index].mimetype,
        });
      }
    }

    let item = await Item.findByIdAndUpdate(req.params.id, {
      type: {
        _id: type._id,
        name: type.name,
      },
      isAvailable: req.body.isAvailable,
      name: req.body.name,
      color: req.body.color,
      size: req.body.size,
      price: req.body.price,
      off: req.body.off,
      img: images,
    });

    if (!item)
      return res.status(404).send("The item with the given ID was not found.");

    item = await Item.findById(req.params.id);
    res.send(item);
  }
);

router.delete("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const item = await Item.findByIdAndRemove(req.params.id);

  if (!item)
    return res.status(404).send("The item with the given ID not found.");

  res.send(item);
});

router.delete(
  "/photo/:id",
  [validateObjectId, auth, admin],
  async (req, res) => {
    let item = await Item.find({
      $in: [
        {
          img: {
            _id: req.body.imageId,
          },
        },
      ],
    });

    if (!item)
      return res.status(404).send("photo with the given ID not found.");

    item.img = {};

    item = await item.save();
    res.send(item);
  }
);

function validator(item) {
  const schema = Joi.object({
    typeId: Joi.objectId().required(),
    name: Joi.string().min(3).max(1024),
    isAvailable: Joi.boolean(),
    color: Joi.string().min(3).max(100),
    size: Joi.string().min(3).max(50),
    off: Joi.number().min(0),
    price: Joi.number().min(0),
  });
  return schema.validate(item);
}

module.exports = router;
