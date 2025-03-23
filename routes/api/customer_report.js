var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
const express = require("express");
const router = express.Router();

var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");

const bcrypt = require("bcrypt");

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
  const from = req.query.from;
  const to = req.query.to;

  console.log(from, to);

  if (uid != null) {
    req.getConnection(function (err, conn) {
      conn.query("SELECT * FROM customers", [], function (err, rows, fields) {
        if (err) {
          res.status(500);
          res.send(JSON.stringify({ success: false, message: err.message }));
        } else {
          if (rows.length > 0) {
            conn.query(
              "SELECT * FROM readings WHERE createdAt BETWEEN ? AND ?",
              [from, to],
              (err, readings, fields) => {
                if (err) {
                  res.status(500);
                  res.send(
                    JSON.stringify({ success: false, message: err.message })
                  );
                } else {
                  // console.log(escalaoDois)
                  conn.query(
                    "SELECT * FROM debts WHERE createdAt BETWEEN ? AND ?",
                    [from, to],
                    (err, debts, fields) => {
                      if (err) {
                        res
                          .status(500)
                          .send(
                            JSON.stringify({ success: false, message: err })
                          );
                      } else {
                        res.send(
                          JSON.stringify({
                            success: true,
                            customers: rows,
                            readings: readings,
                            debts: debts,
                          })
                        );
                      }
                    }
                  );
                }
              }
            );
          } else {
            res.send(
              JSON.stringify({
                success: false,
                message: "Sem nenhum resultado, volte a tentar mais tarde!",
              })
            );
          }
        }
      });
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

// Fetch all customers by companyId
router.get("/:id", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  let branchId = req.params.id;

  if (branchId != null && uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM customers ORDER BY name",
        [],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length > 0) {
              for (let i = 0; i < rows.length; i++) {
                const customer = rows[i];
                consumptionPeriod;
                const barcode = customer.barcode;
                console.log(customer);

                conn.query(
                  "SELECT * FROM readings WHERE barcode=?",
                  [barcode],
                  (err, reading, fields) => {
                    if (err) {
                      console.log(err.message);
                    } else {
                      if (reading.length > 0) {
                        conn.query(
                          "UPDATE customers SET readingStatus=? WHERE barcode=?",
                          [1, barcode],
                          (err, updation, fields) => {
                            if (err) {
                              console.log(err.message);
                            } else {
                              console.log(
                                customer.name + " Actualizado com sucesso."
                              );
                            }
                          }
                        );
                      }
                    }
                  }
                );
              }
              res.send(JSON.stringify({ success: true, result: rows }));
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "No customers registered!",
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

router.put("/", (req, res, nex) => {
  const phoneNumber = req.body.phoneNumber;

  if (phoneNumber != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * from customers WHERE phone=?",
        [phoneNumber],
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
                  message:
                    "Sem nenhum registo associado ao contacto que digitou.",
                })
              );
            }
          }
        }
      );
    });
  } else {
    res.send(
      JSON.stringify({
        success: false,
        message: "Invalid phoneNumber or password",
      })
    );
  }
});

module.exports = router;
