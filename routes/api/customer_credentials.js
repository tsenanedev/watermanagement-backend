var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");

const bcrypt = require("bcrypt");
const emailValidator = require("email-validator");
const jwtMW = exjwt({
  secret: SECRET_KEY,
});

const mailOutput = function (userDetails, password) {
  return `<body>
            <h3>Olá ${userDetails.name}!</h3>
            <p>
            Agradecemos por baixar o nosso <b>APP TSENANE</b> - Aplicativo de Facturação e Pagamento de Água
             do Sistema de Abastecimento de Água de Funhalouro.
            </p>

            <p>As suas credenciais de acesso ao Aplicativo TSENANE são:</p>
            E-mail/telemóvel: <b>${userDetails.email} / ${userDetails.phone}</b> <br>
            Palavra passe: <b>${password}</b><br><br>

            <p><b>NB:</b> Para sua segurança, queira por favor alterar a sua palavra-passe logo que aceder ao seu perfil.</p>

            <br>
            <p>Com os melhores cumprimentos <br><br>
            <b>Departamento de Informática</b><br>
            Contactos: +258 86 313 2801 - Funhalouro <br>
            E-mail: depinf@tsenane.co.mz
            </p>
        </body>`;
};

router.put("/", (req, res, nex) => {
  const email = req.body.email;
  const barcode = req.body.barcode;
  const phoneNumber = "258" + req.body.phoneNumber;

  const password = Math.floor(Math.random() * 1000000) + 1;

  if (barcode != null && email != null && phoneNumber != null) {
    req.getConnection(function (err, conn) {
      if (emailValidator.validate(email)) {
        conn.query(
          "SELECT * FROM customers WHERE barcode=?",
          [barcode],
          function (err, rows, fields) {
            if (err) {
              res
                .status(500)
                .send(JSON.stringify({ success: false, message: err }));
            }
            if (rows.length == 1) {
              const phone = rows[0].phone;
              if (phone == phoneNumber) {
                // Send the email to the given maill address
                let transporter = nodemailer.createTransport({
                  host: "mail.tsenane.co.mz",
                  port: 587,
                  secure: false,
                  auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_SECRET,
                  },
                  tls: {
                    rejectUnauthorized: false,
                  },
                });

                let mailOptions = { 
                  from: '"Departamento de Informática" <depinf@tsenane.co.mz>',
                  to: email,
                  subject: "Credenciais de acesso ao Aplicativo TSENANE",
                  html: mailOutput(rows[0], password),
                };

                try {
                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.log(error);
                      res.status(500).send(
                        JSON.stringify({
                          success: false,
                          message: error.message,
                        })
                      );
                    } else {
                      console.log("Message sent: %s", info.messageId);
                      console.log(
                        "Preview URL: %s",
                        nodemailer.getTestMessageUrl(info)
                      );
                      bcrypt.hash(password + "", 10, (errBcrypt, hash) => {
                        if (errBcrypt) {
                          console.log(errBcrypt);
                          res.status(500);
                          res.send(
                            JSON.stringify({
                              success: false,
                              message: errBcrypt,
                            })
                          );
                        } else {
                          conn.query(
                            "UPDATE customers SET password=?, appAndroid=?, passwordHint=? WHERE barcode=?",
                            [hash, 1, password + "", barcode],
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
                                res.send(
                                  JSON.stringify({
                                    success: true,
                                    message: `Senha actualizada com sucesso!\nE-mail ou celular: ${phoneNumber}\nSenha: ${password}`,
                                  })
                                );
                              }
                            }
                          );
                        }
                      });
                    }
                  });
                } catch (err) {
                  console.log(err);
                  res
                    .status(500)
                    .send(
                      JSON.stringify({ success: false, message: err.message })
                    );
                }
              } else {
                res.send(
                  JSON.stringify({
                    success: false,
                    message:
                      "O telemóvel que digitou não está associado à sua conta.\nLINHA VERDE: +258 86 313 2801 \nE-mail: depinf@tsenane.co.mz",
                  })
                );
              }
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message:
                    "O número do contador que digitou não se encontra registado.\nLINHA VERDE: +258 86 313 2801 \nE-mail: depinf@tsenane.co.mz.",
                })
              );
            }
          }
        );
      } else {
        res.send(
          JSON.stringify({
            success: false,
            message:
              "O email que digitou é inválido! Volte a tentar outra vez.",
          })
        );
      }
    });
  } else {
    res.send(
      JSON.stringify({
        success: false,
        message: "Invalid E-mail or PhoneNumber or Barcode",
      })
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
              "UPDATE customers SET password=? WHERE barcode=?",
              [hash, id],
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
    res.send(JSON.stringify({ success: false, message: "Invalid userId" }));
  }
});

// Create company
router.post("/", jwtMW, (req, res, next) => {
  const uid = req.body.uid;
  const id = req.body.id;
  const tariffTypeId = req.body.tariffTypeId;
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
                      tariffTypeId,
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
          "UPDATE customers SET name=?, email=?, phone=?, meeter_id=?, address=?, nuit=?, status=? WHERE id=?",
          [name, email, phone, meeter_id, address, nuit, status, id],
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
