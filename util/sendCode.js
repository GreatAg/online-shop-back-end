const mongoose = require("mongoose");
const { UserAuth } = require("../models/userAuth");
const config = require("config");
const Kavenegar = require("kavenegar");
var api = Kavenegar.KavenegarApi({
  apikey: config.get("API_KEY_KAVENEGAR"),
});

function sendCode(req, res) {
  const randomNumber = 50000; //Math.floor(Math.random() * (99999 - 11111) + 10000);
  api.Send(
    {
      message: `your verify code is: ${randomNumber}`,
      sender: "10004346",
      receptor: req.body.phoneNumber,
    },
    async (response, status) => {
      let auth = await UserAuth.findOne({ phoneNumber: req.body.phoneNumber });
      if (auth) {
        auth.code = randomNumber;
        auth.messageid = response[0]["messageid"];
      } else {
        auth = new UserAuth({
          phoneNumber: req.body.phoneNumber,
          code: randomNumber,
          messageid: response[0]["messageid"],
        });
      }
      const result = await auth.save();
      res.send({ status, result, response });
    }
  );
}

module.exports.sendCode = sendCode;
