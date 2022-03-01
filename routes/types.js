const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");
const express = require("express");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const router = express.Router();
const { Type, validateType } = require("../models/type");

router.get("/", async (req, res) => {
  const types = await Type.find();
  res.send(types);
});

router.post("/", [validate(validateType), auth], async (req, res) => {
  let type = await Type.findOne({ name: req.body.name });
  if (type) return res.status(400).send("this type already exists.");

  type = new Type({
    name: req.body.name,
    icon: req.body.icon,
  });

  type = await type.save();

  res.send(type);
});

router.put(
  "/:id",
  [validateObjectId, validate(validateType), auth, admin],
  async (req, res) => {
    let type = await Type.findOne({ name: req.body.name });
    if (type) return res.status(400).send("this type already exists.");

    type = await Type.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, icon: req.body.icon },
      {
        new: true,
      }
    );

    if (!type) return res.status(404).send("The type with given id not found.");

    res.send(type);
  }
);

router.delete("/:id", [validateObjectId, auth, admin], async (req, res) => {
  const type = await Type.findByIdAndRemove(req.params.id);

  if (!type)
    return res.status(404).send("The genre with the given ID was not found.");

  res.send(type);
});

module.exports = router;
