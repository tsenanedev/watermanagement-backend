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
  const month = req.query.month;
  const year = req.query.year;

  if (uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM reportnotes WHERE month=? AND year=? ORDER BY id DESC",
        [month, year],
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
                  message: "Notas indisponíveis!",
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

// Delete Repor tNote
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
        "DELETE FROM reportnotes WHERE id=?",
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
                  message: "Nota excluída com sucesso",
                })
              );
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Ocorreu um erro ao excluir este item!",
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

  const month = req.body.month;
  const year = req.body.year;
  const description = req.body.description;
  const staffName = req.body.staffName;

  if (uid != null && description != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "INSERT INTO reportnotes(staffName, description, month, year) VALUES(?,?,?,?)",
        [staffName, description, month, year],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.affectedRows > 0) {
              res.send(
                JSON.stringify({
                  success: true,
                  message: "Nota do relatório submetida com sucesso.",
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

router.put("/", (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;
  const tariffId = req.body.tariffId;

  if (uid != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT SUM(totalOfBill) AS dividaTotal FROM readings WHERE tarrifTypeId = ? AND status = ?",
        [tariffId, 0],
        (err, rows, fields) => {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            res.send(
              JSON.stringify({ success: true, result: rows[0].dividaTotal })
            );
          }
        }
      );
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

module.exports = router;
