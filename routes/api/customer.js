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

  if (uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM customers WHERE uid=?",
        [uid],
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
                  message: "No customer registered with that uid!",
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
        "SELECT * FROM customers WHERE branchId=? ORDER BY name",
        [branchId],
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

  let password = req.body.password;
  password = password + "";

  if (phoneNumber != null && password != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM customers WHERE email=? OR phone=?",
        [phoneNumber, phoneNumber],
        function (err, rows, fields) {
          if (err) {
            res
              .status(500)
              .send(JSON.stringify({ success: false, message: err }));
          }
          if (rows.length == 1) {
            bcrypt.compare(password, rows[0].password, (err, result) => {
              if (err) {
                res.send(
                  JSON.stringify({
                    success: false,
                    message: "Falha autenticação.",
                  })
                );
              }
              if (result) {
                console.log(phoneNumber, password);
                const response = [
                  {
                    id: rows[0].id,
                    uid: rows[0].uid,
                    name: rows[0].name,
                    barcode: rows[0].barcode,
                    branchId: rows[0].branchId,
                    meeter_type: rows[0].meeter_type,
                    email: rows[0].email,
                    phone: rows[0].phone,
                    address: rows[0].address,
                    status: rows[0].status,
                    tarrifTypeId: rows[0].tarrifTypeId,
                    nuit: rows[0].nuit,
                    createdAt: rows[0].createdAt,
                    lat: rows[0].lat,
                    lng: rows[0].lng,
                    readingStatus: rows[0].readingStatus,
                  },
                ];
                res.send(JSON.stringify({ success: true, result: response }));
              } else {
                res.send(
                  JSON.stringify({
                    success: false,
                    message: "A senha que digitou está incorrecta.",
                  })
                );
              }
            });
          } else {
            res.send(
              JSON.stringify({
                success: false,
                message:
                  "O E-mail ou Celular que digitou não encontra-se registado.",
              })
            );
          }
        }
      );
    });
  } else {
    res.send(
      JSON.stringify({ success: false, message: "Invalid E-mail or Password" })
    );
  }
});

router.patch("/", (req, res, nex) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }

  const id = req.body.barcode;
  const code = req.body.password;

  if (code != null && id != null) {
    req.getConnection(function (err, conn) {
      if (err) {
        res.status(500).send(JSON.stringify({ success: false, message: err }));
      } else {
        bcrypt.hash(code, 10, (errBcrypt, hash) => {
          if (errBcrypt) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: errBcrypt }));
          } else {
            conn.query(
              "UPDATE customers SET password=?, passwordHint=? WHERE barcode=?",
              [hash, code, id],
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
                        message: "Senha actualizada com sucesso",
                      })
                    );
                  }
                }
              }
            );
          }
        });
      }
    });
  } else {
    res.send(
      JSON.stringify({
        success: false,
        message: "Invalid userId. Try again later.",
      })
    );
  }
});

// Create company
router.post("/", jwtMW, (req, res, next) => {
  const uid = req.body.uid;
  const id = req.body.id;
  const tarrifTypeId = req.body.tarrifTypeId;
  const meeter_type = req.body.meeter_type;
  const barcode = req.body.barcode;
  const meeter_id = req.body.meeter_id;
  const name = req.body.name;
  const email = req.body.email;
  const nuit = req.body.nuit;
  const phone = req.body.phone;
  const address = req.body.address;
  const branchId = req.body.branchId;
  const status = req.body.status;
  const createdAt = new Date();
  const password = "123456";
  const lat = req.body.lat;
  const lng = req.body.lng;

  if (name != null && phone != null) {
    req.getConnection(function (err, conn) {
      if (id == null) {
        conn.query(
          "SELECT * FROM meters WHERE meterNumber=? AND status=? LIMIT 1",
          [barcode, 0],
          (err, rows, fields) => {
            if (err) {
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else if (rows.length > 0) {
              bcrypt.hash(password, 10, (errBcrypt, hash) => {
                if (errBcrypt) {
                  res.status(500);
                  res.send(
                    JSON.stringify({ success: false, message: errBcrypt })
                  );
                } else {
                  conn.query(
                    "INSERT INTO customers(uid, tarrifTypeId, meeter_type, barcode, meeter_id, name, email, nuit, phone, address, branchId, status, createdAt, password) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    [
                      uid,
                      tarrifTypeId,
                      meeter_type,
                      barcode,
                      meeter_id,
                      name,
                      email,
                      nuit,
                      phone,
                      address,
                      branchId,
                      status,
                      createdAt,
                      hash,
                    ],
                    function (err, rows, fields) {
                      if (err) {
                        console.log(err);
                        res.status(500);
                        res.send(
                          JSON.stringify({
                            success: false,
                            message: err.message,
                          })
                        );
                      } else {
                        if (rows.affectedRows > 0) {
                          const barcodeId = rows.insertId;
                          conn.query(
                            "UPDATE meters SET status=? WHERE meterNumber=?",
                            [barcodeId, barcode],
                            (err, rows, field) => {
                              if (err) {
                                res.send(
                                  JSON.stringify({
                                    success: false,
                                    message: err.message,
                                  })
                                );
                              } else {
                                res.send(
                                  JSON.stringify({
                                    success: true,
                                    message: "Inserted successufully",
                                  })
                                );
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
              res.send(
                JSON.stringify({
                  success: false,
                  message: "O contador selecionado está em uso.",
                })
              );
            }
          }
        );
      } else {
        conn.query(
          "UPDATE customers SET name=?, email=?, phone=?, tarrifTypeId=?, meeter_id=?, address=?, nuit=?, status=?, lat=?, lng=? WHERE id=?",
          [
            name,
            email,
            phone,
            tarrifTypeId,
            meeter_id,
            address,
            nuit,
            status,
            lat,
            lng,
            id,
          ],
          function (err, rows, fields) {
            if (err) {
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else if (rows.affectedRows > 0) {
              res.send(
                JSON.stringify({
                  success: true,
                  message: "Updated successfully",
                })
              );
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
