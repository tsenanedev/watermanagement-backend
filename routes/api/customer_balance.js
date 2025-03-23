const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

// Fetch all Available Banks
router.get("/", jwtMW, (req, res, next) => {
  req.getConnection(function (err, conn) {
    conn.query("SELECT * FROM customerBalance", function (err, rows, fields) {
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
              message: "Pagamentos indisponíveis!",
            })
          );
        }
      }
    });
  });
});

// Fetch all BankAcounts by companyId
router.get("/:id", jwtMW, (req, res, next) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  let customerId = req.params.id;

  if (customerId != null && uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM customerBalance WHERE barcode=? ORDER BY id DESC",
        [customerId],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length > 0) {
              // res.send(JSON.stringify({ success: true, result: rows }))
              const payments = rows;
              conn.query(
                "SELECT * FROM customerBalance WHERE barcode=? ORDER BY id DESC LIMIT 1",
                [customerId],
                function (err, rows, fields) {
                  if (err) {
                    res.status(500);
                    res.send(
                      JSON.stringify({ success: false, message: err.message })
                    );
                  } else {
                    if (rows.length > 0) {
                      res.send(
                        JSON.stringify({
                          success: true,
                          result: payments,
                          currentBalance: rows[0].balance,
                        })
                      );
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
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

// Delete BankAccount
router.delete("/:id", jwtMW, (req, res, next) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  let id = req.params.id;

  if (id != null && uid != null && uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "DELETE FROM customerBalance WHERE id=?",
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
                  message: "Deletado com sucesso",
                })
              );
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Ocorreu um erro ao excluir este pagamento!",
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

// Add BankAccount
router.post("/", jwtMW, (req, res, next) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  const customerId = req.body.customerId;
  const barcode = req.body.barcode;
  const phoneNumber = req.body.phoneNumber;
  const reference = req.body.reference;
  const amount = req.body.amount;

  if (barcode != null && uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM customerBalance WHERE customerId=? ORDER BY id DESC LIMIT 1",
        [customerId],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length > 0) {
              const balance = parseFloat(rows[0].balance) + parseFloat(amount);
              console.log(rows[0].balance);
              const credit = amount;
              const debt = 0;
              const provider = "MultiPay";
              const status = "pending";

              conn.query(
                "INSERT INTO customerBalance(customerId, barcode, phoneNumber, debt, credit, balance, reference, description, provider, status) VALUES(?,?,?,?,?,?,?,?,?,?)",
                [
                  customerId,
                  barcode,
                  phoneNumber,
                  debt,
                  credit,
                  balance,
                  reference,
                  "Depósito Via MultiPay",
                  provider,
                  status,
                ],
                function (err, fields, rows) {
                  if (err) {
                    console.log(err);
                    res.status(500);
                    res.send(
                      JSON.stringify({ success: false, message: err.message })
                    );
                  } else {
                    res.send(
                      JSON.stringify({
                        success: true,
                        message: "Referência gerada com sucesso!",
                      })
                    );
                  }
                }
              );
            } else {
              const balance = parseFloat(amount);
              const credit = amount;
              const debt = 0;
              const provider = "MultiPay";
              const status = "pending";

              conn.query(
                "INSERT INTO customerBalance(customerId, barcode, phoneNumber, debt, credit, balance, reference, description, provider, status) VALUES(?,?,?,?,?,?,?,?,?,?)",
                [
                  customerId,
                  barcode,
                  phoneNumber,
                  debt,
                  credit,
                  balance,
                  reference,
                  "Depósito Via MultiPay",
                  provider,
                  status,
                ],
                function (err, fields, rows) {
                  if (err) {
                    console.log(err);
                    res.status(500);
                    res.send(
                      JSON.stringify({ success: false, message: err.message })
                    );
                  } else {
                    res.send(
                      JSON.stringify({
                        success: true,
                        message: "Referência gerada com sucesso!",
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
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

module.exports = router;
