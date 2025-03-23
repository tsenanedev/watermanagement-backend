var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
const express = require("express");
const router = express.Router();

var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

// Fetch all Available Banks
router.get("/", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;
  const branchId = req.query.branchId;

  if (uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM debts WHERE branchId=? AND status=?",
        [branchId, 0],
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
                  message: "Divida indisponivei!",
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

// Fetch all Transactions by companyId
router.get("/:id", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  let barcode = req.params.id;

  if (barcode != null && uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM debts WHERE barcode=?",
        [barcode],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            conn.query(
              "SELECT SUM(amount) AS totalDues FROM debts WHERE status=? AND barcode=?",
              [0, barcode],
              function (err, row, fields) {
                if (err) {
                  res.status(500);
                  res.send(
                    JSON.stringify({ success: false, message: err.message })
                  );
                } else {
                  conn.query(
                    "SELECT * FROM payments WHERE barcode=? ORDER BY id DESC",
                    [barcode],
                    (err, payments, fields) => {
                      if (err) {
                        res
                          .status(500)
                          .send(
                            JSON.stringify({
                              success: false,
                              message: err.message,
                            })
                          );
                      } else {
                        res.send(
                          JSON.stringify({
                            success: true,
                            result: rows,
                            totalDues: row[0].totalDues,
                            payments: payments,
                          })
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

router.put("/:id", (req, res, next) => {

  let barcode = req.params.id;

  if (barcode != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "UPDATE debts SET status = ? WHERE barcode=?",
        [1, barcode],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            res.send(
              JSON.stringify({
                success: true,
                message: "Dívida invalidada com sucesso",
              })
            );
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

// Delete debts
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
        "DELETE FROM debts WHERE id=? ORDER BY id DESC",
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
                  message: "Divida excluida com sucesso",
                })
              );
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Ocorreu um erro ao excluir esta divida!",
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

// Add Dues
router.post("/", (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  const barcode = req.body.barcode;
  const amount = req.body.amount;
  const status = req.body.status;
  const description = req.body.description;
  const staffName = req.body.staffName;
  const branchId = req.body.branchId;
  const createdAt = new Date();
  const invalidateMulta = req.body.invalidateMulta;
  const billId = req.body.billId;
  const staffId = req.body.staffId;

  if (uid != null) {
    req.getConnection(function (err, conn) {
      if (invalidateMulta == 1) {
        conn.query(
          "UPDATE readings SET forfeit=? WHERE receiptNumber=?",
          [0, billId],
          (err, update, fields) => {
            if (err) {
              res
                .status(500)
                .send(JSON.stringify({ success: false, message: err.message }));
            } else {
              if (update.affectedRows > 0) {
                conn.query(
                  "DELETE FROM debts WHERE billId=?",
                  [billId],
                  (err, deleted, fields) => {
                    if (err) {
                      res
                        .status(500)
                        .send({ success: false, message: err.messa });
                    } else {
                      res.send({
                        success: true,
                        message: "Deleted successfully",
                      });
                    }
                  }
                );
              }
            }
          }
        );
      } else {
        conn.query(
          "INSERT INTO debts(barcode, amount, description, staffName, branchId, status, createdAt) VALUES(?,?,?,?,?,?,?)",
          [
            barcode,
            amount,
            description,
            staffName,
            branchId,
            status,
            createdAt,
          ],
          function (err, rows, fields) {
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
                    message: "Dívida submetida com sucesso.",
                  })
                );
              }
            }
          }
        );
      }
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

module.exports = router;
