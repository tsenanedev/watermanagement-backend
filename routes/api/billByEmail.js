var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_SECRET;
const emailReplyTo = process.env.EMAIL_REPLY_TO;

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

const transporter = nodemailer.createTransport({
  host: "mail.tsenane.co.mz",
  port: 587,
  secure: false,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.post("/", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }

  const uid = decoded.uid;
  const barcode = req.body.barcode;
  const emailTo = req.body.to;
  const emailBody = req.body.emailBody;

  if (uid != null) {
    transporter
      .sendMail({
        from: user,
        to: emailTo,
        replyTo: emailReplyTo,
        subject: "Envio da Factura" + 123456,
        text: emailBody,
        attachments: [
          {
            filename: "20200900733_8_2022.pdf",
            path: __dirname + "../../../uploads/tsenan/20200900733_8_2022.pdf",
          },
        ],
      })
      .then((info) => {
        res.send(JSON.stringify({ success: true, result: info }));
      })
      .catch((err) => {
        res.send(JSON.stringify({ success: false, message: err }));
      });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

module.exports = router;
