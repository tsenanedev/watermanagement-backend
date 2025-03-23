var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");
const moment = require("moment");

const whatsAppCloudApi = require("../../whatsAppCloudApi");

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

router.post("/", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }

  const phone = req.body.phone;
  const barcode = req.body.barcode;
  const staffName = req.body.staffName;
  const message = req.body.message;
  const createdAt = moment().format("DD-MM-YYYY").toLocaleString();
  const status = 0;

  req.getConnection(async (err, conn) => {
    if (err) {
      console.log(err);
      res.status(500);
      res.send(JSON.stringify({ success: false, message: err.message }));
    } else {
      const passingValues = {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: message,
        },
      };

      try {
        const sendMessage = await whatsAppCloudApi.sendWhatsApp(passingValues);
        console.log(sendMessage);
        conn.query(
          "INSERT INTO whatsapp (phone, message, barcode, staffName, status, createdAt) VALUES(?,?,?,?,?,?)",
          [phone, message, barcode, staffName, status, createdAt],
          (err, rows, fields) => {
            if (err) {
              console.log(err);
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else {
              console.log("Whatsapp success received a message.");
              res.send(JSON.stringify({ success: true, result: sendMessage }));
            }
          }
        );
      } catch (err) {
        console.log(err);
        res.send(JSON.stringify({ success: false, result: err }));
      }
    }
  });
});

module.exports = router;
