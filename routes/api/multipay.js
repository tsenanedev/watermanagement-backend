let SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const express = require("express");
const router = express.Router();
let jwt = require("jsonwebtoken");
let exjwt = require("express-jwt");
let fetch = require("node-fetch");

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

router.get("/", (req, res, next) => {
  console.log("Leonel Zacarias Matsinhe");

  const entity = req.query.entity;
  const reference = req.query.reference;
  const value = parseInt(req.query.value) / 100;
  const transactionId = req.query.transactionId;
  const provider = req.query.provider;
  // const paymentdatetime = req.query.paymentdatetime
  const paymentdatetime = `${new Date().getFullYear()}-${
    new Date().getMonth() + 1
  }-${new Date().getDate()}`;

  if (entity != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "UPDATE customerBalance SET provider=?, status=? WHERE reference=?",
        [provider, "paid", reference],
        function (err, rows, fields) {
          if (err) {
            // console.log('Leonel: ' + err)
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err }));
          } else if (rows.affectedRows > 0) {
            // console.log('Leonel: ' + "Sucesso")
            res.status(200);
            res.send(JSON.stringify({ success: true, message: "Success" }));
          } else {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err }));
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

router.get("/:id", jwtMW, (req, res, next) => {
  let authorization = req.headers.authorization,
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
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  const transactionId = req.body.transactionId;
  const value = req.body.value * 100;

  console.log(transactionId, value, uid);

  if (transactionId != null && value != null && uid != null) {
    let fields = {
      transactionId: transactionId,
      value: value,
      username: "TESTE_02",
    };

    fetch("https://lin4.sislog.com/mobile/reference/request", {
      method: "POST",
      body: JSON.stringify(fields),
      headers: {
        apiKey: "39vg7gm3RsYqbAJ4rLIYyghqJzGkdBg8",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) =>
        res.send(JSON.stringify({ success: true, message: json }))
      )
      .catch((err) =>
        res.send(JSON.stringify({ success: false, message: err }))
      );
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid userUid" }));
  }
});

module.exports = router;
