const express = require("express");
const users = require("../routes/users");
const auth = require("../routes/auth");
const types = require("../routes/types");
const items = require("../routes/items");
const shops = require("../routes/shops");
const admin = require("../routes/admin");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json({ limit: "50mb" }));
  app.use(
    express.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 1000000,
    })
  );
  var cors = require("cors");
  app.use(cors());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/admin", admin);
  app.use("/api/types", types);
  app.use("/api/items", items);
  app.use("/api/shops", shops);
  app.use(error);
};
