var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");
const authController = require("../../src/Controllers/authController");
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

module.exports = router;
