let SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
const express = require("express");
const axios = require("axios");

const smsUrl = process.env.TEXT_LOCAL_URL;
const smsApiKey = process.env.TEXT_LOCAL_API_KEY;
const smsSender = process.env.TEXT_LOCAL_SENDER;

const router = express.Router();

let jwt = require("jsonwebtoken");
let exjwt = require("express-jwt");

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

// Fetch all Available Banks
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
      conn.query("SELECT * FROM transactions", function (err, rows, fields) {
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
                message: "Pagamentos indisponiveis!",
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

// Fetch all Transactions by companyId
router.get("/:id", jwtMW, (req, res, next) => {
  let authorization = req.headers.authorization,
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
        "SELECT * FROM transactions WHERE companyId=?",
        [companyId],
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
                  message: "Pagamentos indisponiveis!",
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

// Delete Transaction
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

  if (id != null && uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "DELETE FROM transactions WHERE id=? ORDER BY ID DESC",
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
                  message: "Pagamento excluido com sucesso",
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
router.post("/", (req, res, next) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  const number = req.body.number;
  const barcode = req.body.barcode;
  const smsBody = req.body.smsBody;

  if (uid != null && smsBody != null) {
    req.getConnection(function (err, conn) {
      if (err) {
        res.status(500);
        res.send(JSON.stringify({ success: false, message: err.message }));
      } else {
        // const sms = urlencoded(smsBody);
        // console.log(sms.toString())
        // return
        // const textLocalUrl = `${smsUrl}?apikey=${smsApiKey}&numbers=${number}&sender=${smsSender}&message=${smsBody}`;
        // console.log(textLocalUrl);

        axios
          .post(smsUrl, {
            apiKey: smsApiKey,
            numbers: number,
            smsBody: smsBody,
            barcode: barcode,
            sender: "TSENANE",
          })
          .then((response) => {
            // console.log(response.toString());
            res.send(JSON.stringify({ success: false, message: response }));
          })
          .catch((err) => {
            console.log(err);
            res.send(JSON.stringify({ success: false, message: err }));
          });
      }
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

module.exports = router;
