let SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const express = require("express");
const router = express.Router();
let jwt = require("jsonwebtoken");
let exjwt = require("express-jwt");

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

router.get("/", jwtMW, (req, res, next) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }

  const uid = decoded.uid;
  if (uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM contractPayments ORDER BY id DESC",
        [],
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
                  message: "Sem nenhum resultado!",
                })
              );
            }
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid Request!" }));
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
  const invoiceId = req.params.id;

  if (uid != null && invoiceId != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM contractPayments WHERE invoiceId=? ORDER BY id DESC",
        [invoiceId],
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
                  message: "Sem nenhum pagamento!",
                })
              );
            }
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid Request!" }));
  }
});

router.put("/", jwtMW, async function (req, res, next) {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  const invoiceId = req.body.invoiceId;
  const status = req.body.status;

  if (uid != null) {
    req.getConnection((err, conn) => {
      if (err) {
        res.status(500);
        res.send(JSON.stringify({ success: false, message: err.message }));
      } else {
        conn.query(
          "UPDATE proforma SET status=? WHERE invoiceId=?",
          [status, invoiceId],
          (err, rows, fields) => {
            if (err) {
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else {
              if (rows.affectedRows > 0) {
                res.send(
                  JSON.stringify({
                    success: true,
                    message: "Payment updated successfully.",
                  })
                );
              }
            }
          }
        );
      }
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid Request!" }));
  }
});

router.post("/", jwtMW, async function (req, res, next) {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  const invoiceId = req.body.invoiceId;
  const paymentMethod = req.body.paymentMethod;
  const paymentReference = req.body.paymentReference;
  const phoneNumber = req.body.phoneNumber;
  const amountPaid = req.body.amountPaid;
  const staffId = req.body.staffId;

  if (uid != null) {
    req.getConnection((err, conn) => {
      if (err) {
        res.status(500);
        res.send(JSON.stringify({ success: false, message: err.message }));
      } else {
        conn.query(
          "INSERT INTO contractPayments (invoiceId, paymentMethod, paymentReference, phoneNumber, amountPaid, staffId) VALUES(?,?,?,?,?,?)",
          [
            invoiceId,
            paymentMethod,
            paymentReference,
            phoneNumber,
            amountPaid,
            staffId,
          ],
          (err, rows, fields) => {
            if (err) {
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else {
              if (rows.affectedRows > 0) {
                res.send(
                  JSON.stringify({
                    success: true,
                    message: "Payment inserted successfully.",
                  })
                );
              }
            }
          }
        );
      }
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid Request!" }));
  }
});

module.exports = router;
