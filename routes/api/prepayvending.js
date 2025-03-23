var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");
var fetch = require("node-fetch");

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

router.put("/:id", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  if (uid != null) {
    let fields = {
      username: "TESTE_02",
      dateStart: "20210701000000",
      dateEnd: "20210710000000",
    };

    fetch("https://lin4.sislog.com/mobile/status/get", {
      method: "GET",
      body: fields,
      headers: {
        apiKey: "39vg7gm3RsYqbAJ4rLIYyghqJzGkdBg8",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => res.send(JSON.stringify({ success: true, result: json })))
      .catch((err) =>
        res.send(JSON.stringify({ success: false, message: err }))
      );
  } else {
    res.send(JSON.stringify({ success: false, message: "Unauthorized User" }));
  }
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

  const meter_id = req.body.meter_id;
  const value = req.body.value;

  if (meter_id != null && value != null && uid != null) {

    let fields = {
      login_id: process.env.PRE_PAY_LOGIN_ID,
      login_pwd: process.env.PRE_PAY_LOGIN_PWD,
      meter_id: meter_id,
      value: value,
    };

    fetch(`${preview}`, {
      method: "POST",
      body: JSON.stringify(fields),
    })
      .then((res) => res.json())
      .then((json) =>
        res.send(JSON.stringify({ success: true, message: json }))
      )
      .catch((err) =>
        res.send(JSON.stringify({ success: false, message: err }))
      );
  } else {
    res.send(
      JSON.stringify({
        success: false,
        message: "Número de contador ou montante da compra inválido.",
      })
    );
  }
});

module.exports = router;
