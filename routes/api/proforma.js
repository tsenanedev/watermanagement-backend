let SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const express = require("express");
const router = express.Router();
let jwt = require("jsonwebtoken");
let exjwt = require("express-jwt");
const pdf = require("html-pdf");

const billingCalcs = require("../../billingCalcs");

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
        "SELECT * FROM proforma ORDER BY id DESC",
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
  const proformaId = req.params.id;

  if (uid != null && proformaId != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM proforma WHERE id=? ORDER BY id DESC",
        [proformaId],
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
  const preRegistrationId = req.body.preRegistrationId;
  const customerName = req.body.customerName;
  const customerAddress = req.body.customerAddress;
  const customerPhoneNumber = req.body.customerPhoneNumber;
  const customerNuit = req.body.customerNuit;
  const customerEmail = req.body.customerEmail;
  const staffName = req.body.staffName;
  const itemsDetails = req.body.itemsDetails;

  if (itemsDetails != null) {
    req.getConnection((err, conn) => {
      if (err) {
        res.status(500);
        res.send(JSON.stringify({ success: false, message: err.message }));
      } else {
        conn.query(
          "INSERT INTO proforma (invoiceId, preRegistrationId, customerName, customerAddress, customerPhoneNumber, customerNuit, customerEmail, staffName, itemsDetails) VALUES(?,?,?,?,?,?,?,?,?)",
          [
            invoiceId,
            preRegistrationId,
            customerName,
            customerAddress,
            customerPhoneNumber,
            customerNuit,
            customerEmail,
            staffName,
            itemsDetails,
          ],
          (err, proforma, fields) => {
            if (err) {
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else {
              if (proforma.affectedRows > 0) {
                conn.query(
                  "UPDATE pre_registration SET status=? WHERE id=?",
                  [1, preRegistrationId],
                  (err, update, fields) => {
                    if (err) {
                      res.status(500);
                      res.send(
                        JSON.stringify({ success: false, message: err.message })
                      );
                    } else {
                      res.send(
                        JSON.stringify({
                          success: true,
                          message: "Factura Proforma inserida com sucesso.",
                        })
                      );
                    }
                  }
                );
              } else {
                res.send(
                  JSON.stringify({
                    success: false,
                    message: "Ocorreu um erro na insersção da factura!",
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

router.get("/:id", (re, res, next) => {
  const barcode = req.params.id;
});

module.exports = router;
