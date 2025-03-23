const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

// Fetch all companies
router.get("/", jwtMW, (req, res, next) => {
  req.getConnection(function (err, conn) {
    conn.query(
      "SELECT * FROM meters WHERE status=? ORDER BY id LIMIT 100",
      [0],
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
                message: "No meters have been registered so far!",
              })
            );
          }
        }
      }
    );
  });
});

// Fetch companyById
router.get("/:id/:branchId/:limit", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  let searchValue = req.params.id;

  if (searchValue != null && uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM meters WHERE meterNumber LIKE ? LIMIT 15",
        ["%" + searchValue + "%"],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length > 0) {
              res.send(JSON.stringify({ success: true, result: rows }));
            } else {
              res.send(
                JSON.stringify({ success: false, message: "Meter not found!" })
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

// Create company
router.post("/", jwtMW, (req, res, next) => {
  // const meterNumber = req.body.meterNumber
  const diameter = req.body.diameter;
  const description = req.body.description;
  const createdAt = `${new Date().getDate()}/${
    new Date().getMonth() + 1
  }/${new Date().getFullYear()}`;

  if (branchId != null && diameter != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT MAX(meterNumber) AS ultimoCodigo FROM meters",
        [],
        (err, maxMeterNumber, fields) => {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err }));
          } else {
            if (maxMeterNumber.length > 0) {
              const maxMeter = parseInt(maxMeterNumber[0].ultimoCodigo) + 1;
              conn.query(
                "INSERT INTO meters (meterNumber, description, diameter, createdAt) VALUES(?,?,?,?)",
                [maxMeter, description, diameter, createdAt],
                (err, rows, fields) => {
                  if (err) {
                    res.status(500);
                    res.send(JSON.stringify({ success: false, message: err }));
                  } else {
                    res.send(
                      JSON.stringify({
                        success: true,
                        message: "Contador cadastrado com sucesso: " + maxMeter,
                      })
                    );
                  }
                }
              );
            } else {
              const maxMeter = "20000000000";
              conn.query(
                "INSERT INTO meters (meterNumber, description, diameter, createdAt) VALUES(?,?,?,?)",
                [maxMeterNumber, description, diameter, createdAt],
                (err, rows, fields) => {
                  if (err) {
                    res.status(500);
                    res.send(JSON.stringify({ success: false, message: err }));
                  } else {
                    res.send(
                      JSON.stringify({
                        success: true,
                        message:
                          "Contador cadastrado com sucesso " + maxMeterNumber,
                      })
                    );
                  }
                }
              );
            }
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid Request" }));
  }
});

module.exports = router;
