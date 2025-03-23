const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

// Fetch all bills by companyId
router.get("/", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  if (uid != null) {
    const queryParameter = req.query.prepaid;

    const sqlOne = "SELECT * FROM customers ORDER BY name LIMIT ?";
    const sqlTwo =
      "SELECT * FROM customers WHERE meeter_type = ? ORDER BY name LIMIT ?";

    req.getConnection(function (err, conn) {
      conn.query(
        queryParameter == 1 ? sqlTwo : sqlOne,
        queryParameter == 1 ? [2, 9] : [9],
        function (err, rows, fields) {
          if (err) {
            console.log(err);
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length > 0) {
              res.send(JSON.stringify({ success: true, result: rows }));
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Clientes indisponíveis!",
                })
              );
            }
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

router.get("/:id/:prepaid", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  let searchValue = req.params.id;
  let queryParameter = req.params.prepaid;

  if (searchValue != null && uid != null && queryParameter == 1) {
    const serachVal = `%${searchValue}%`;

    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM customers WHERE name LIKE ? OR nuit LIKE ? OR email LIKE ? OR phone LIKE ? OR meeter_id LIKE ? OR barcode LIKE ? ORDER BY name LIMIT 9",
        [serachVal, serachVal, serachVal, serachVal, serachVal, serachVal],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length > 0) {
              res.send(JSON.stringify({ success: true, result: rows }));
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Clientes indisponíveis!",
                })
              );
            }
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

router.post("/", jwtMW, function (req, res, nex) {
  req.getConnection(function (error, conn) {
    const user_lat = parseFloat(req.body.lat);
    const user_lng = parseFloat(req.body.lng);
    const distance = parseFloat(req.body.distance);
    const branchId = req.body.branchId;

    if (user_lat != Number.NaN && user_lng != Number.NaN) {
      conn.query(
        "SELECT * FROM (SELECT id, name, phone, uid, barcode, meeter_type, branchId, email, nuit, address, createdAt, lat, lng, meeter_id, status," +
          "ROUND(111.045 * DEGREES(ACOS(COS(RADIANS(?)) * COS(RADIANS(lat))" +
          "* COS(RADIANS(lng) - RADIANS(?)) + SIN(RADIANS(?))" +
          "* SIN(RADIANS(lat)))),2) AS distance_in_km FROM customers)tempTable WHERE distance_in_km < ? AND branchId=?",
        [user_lat, user_lng, user_lat, distance, branchId],
        function (err, rows, fields) {
          if (err) {
            console.log(err.message);
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length > 0) {
              res.send(JSON.stringify({ success: true, result: rows }));
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Sem nenhum registo",
                })
              );
            }
          }
        }
      );
    } else {
      res.send(
        JSON.stringify({
          success: false,
          message: "Localização não fornecida!",
        })
      );
    }
  });
});

module.exports = router;
