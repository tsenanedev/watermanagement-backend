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
    conn.query("SELECT * FROM companies", function (err, rows, fields) {
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
              message: "No companies registered!",
            })
          );
        }
      }
    });
  });
});

// Fetch companyById
router.get("/:id", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  let companyId = req.params.id;

  if (companyId != null && uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM companies WHERE id=?",
        [companyId],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length > 0) {
              conn.query(
                "SELECT * FROM branches WHERE companyId=? ORDER BY name",
                [companyId],
                (err, branches, fields) => {
                  if (err) {
                    res
                      .status(500)
                      .send(JSON.stringify({ success: false, message: err }));
                  } else {
                    res.send(
                      JSON.stringify({
                        success: true,
                        result: rows,
                        branches: branches,
                      })
                    );
                  }
                }
              );
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Company not registered!",
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
  const name = req.body.name;
  const id = req.body.id;
  const email = req.body.email;
  const nuit = req.body.nuit;
  const phone = req.body.phone;
  const address = req.body.address;
  const bankAccount = req.body.bankAccount;
  const nib = req.body.nib;
  const status = req.body.status;
  const createdAt = new Date();

  if (name != null && phone != null) {
    req.getConnection(function (err, conn) {
      if (id == null) {
        conn.query(
          "INSERT INTO companies(name, email, phone, nuit, address, bankAccount, nib, status) VALUES(?,?,?,?,?,?,?,?)",
          [name, email, phone, nuit, address, bankAccount, nib, status],
          function (err, rows, fields) {
            if (err) {
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else {
              if (rows.affectedRows > 0) {
                const insertId = rows.insertId;
                console.log(insertId);
                res.send(
                  JSON.stringify({
                    success: true,
                    message: "Dados inseridos com sucesso.",
                    inserId: insertId,
                  })
                );
              }
            }
          }
        );
      } else {
        conn.query(
          "UPDATE companies SET name=?, email=?, phone=?, nuit=?, address=?, bankAccount=?, nib=?, status=? WHERE id=?",
          [name, email, phone, nuit, address, bankAccount, nib, status, id],
          (err, updation, fields) => {
            if (err) {
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else {
              if (updation.affectedRows > 0) {
                conn.query(
                  "SELECT * FROM companies WHERE id=?",
                  [id],
                  (err, updated, fields) => {
                    if (err) {
                      res.status(500);
                      res.send(
                        JSON.stringify({ success: false, message: err.message })
                      );
                    } else {
                      if (updated.length > 0) {
                        res.send(
                          JSON.stringify({
                            success: true,
                            message: "Dados actualizados com sucesso.",
                            result: updated,
                          })
                        );
                      } else {
                        res.send(
                          JSON.stringify({
                            success: false,
                            message: "Houve um erro na actualização de dados",
                          })
                        );
                      }
                    }
                  }
                );
              }
            }
          }
        );
      }
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid userId" }));
  }
});

module.exports = router;
