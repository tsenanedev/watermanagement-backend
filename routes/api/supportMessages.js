var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
const express = require("express");
const router = express.Router();

var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");
const moment = require("moment");

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

// Fetch customersByUid
router.get("/", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;
  const status = req.query.status;

  if (uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM support",
        [status],
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
                  message: "Messages not found!",
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

router.get("/:id", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;
  let id = req.params.id;

  if (uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM support WHERE fromNumber=? OR toNumber=?",
        [id, id],
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
                  message: "YOu have no messages.",
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

// Delete Billing
router.delete("/:id", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  let id = req.params.id;

  if (id != null && uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "DELETE FROM support WHERE id=?",
        [id],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.affectedRows > 0) {
              res.send(
                JSON.stringify({
                  success: true,
                  message: "Message successfully deleted!",
                })
              );
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "There was an error deleting this message!",
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

// Create company
router.post("/", jwtMW, (req, res, next) => {
  const categoryType = req.body.categoryType;
  const fromNumber = req.body.fromNumber;
  const toNumber = req.body.toNumber;
  const messageBody = req.body.messageBody;
  const sentDateTime = moment().format("YYYY-MM-DD hh:mm");
  const customerName = req.body.customerName;
  const status = req.body.status;

  if (fromNumber != null && toNumber != null && messageBody != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "INSERT INTO support(customerName, categoryType, fromNumber, toNumber, messageBody, sentDateTime, status) VALUES(?,?,?,?,?,?,?)",
        [
          customerName,
          categoryType,
          fromNumber,
          toNumber,
          messageBody,
          sentDateTime,
          status,
        ],
        (err, rows, fields) => {
          if (err) {
            console.log(err);
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            res.send(
              JSON.stringify({ success: true, message: "Message successfully sent!" })
            );
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid userId" }));
  }
});

module.exports = router;
