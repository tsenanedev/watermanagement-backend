var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");

const bcrypt = require("bcrypt");

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

router.put("/", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }

  const uid = decoded.uid;
  const id = req.body.id;
  const code = req.body.code;

  if (uid != null && code != null && id != null) {
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
              "UPDATE users SET code=?, password=? WHERE id=?",
              [code, hash, id],
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

// User Login
router.post("/", (req, res, next) => {
  const email = req.body.email;
  let password = req.body.password;
  password = password + "";

  if (email != null && password != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM users WHERE email=? OR phoneNumber=? AND status=?",
        [email, email, 1],
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
                const response = [
                  {
                    id: rows[0].id,
                    name: rows[0].name,
                    code: rows[0].code,
                    email: rows[0].email,
                    phoneNumber: rows[0].phoneNumber,
                    userRole: rows[0].userRole,
                    status: rows[0].status,
                    branchId: rows[0].branchId,
                    uid: rows[0].uid,
                    createdAt: rows[0].createdAt,
                    companyId: rows[0].companyId,
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

module.exports = router;
