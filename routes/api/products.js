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
  const branchId = req.query.branchId;

  req.getConnection(function (err, conn) {
    conn.query(
      "SELECT * FROM products ORDER BY id DESC",
      [],
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
                message: "No products have been registered so far!",
              })
            );
          }
        }
      }
    );
  });
});

// Delete Product
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
        "DELETE FROM products WHERE id=?",
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
                  message: "Produto excluído com sucesso",
                })
              );
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Ocorreu um erro ao excluir este produto!",
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
  const productId = req.body.productId;
  const diameter = req.body.diameter;
  const taxaDepositoGarantia = req.body.taxaDepositoGarantia;
  const taxaVistoriaSemTransporte = req.body.taxaVistoriaSemTransporte;
  const taxaVistoriaComTransporte = req.body.taxaVistoriaComTransporte;
  const taxaSubscricaoContrato = req.body.taxaSubscricaoContrato;
  const taxaCorteReligacao = req.body.taxaCorteReligacao;
  const taxaAfericaoContador = req.body.taxaAfericaoContador;
  const taxaEncargoContadorDanificado = req.body.taxaEncargoContadorDanificado;
  const taxaEncargoViolacaoInstalacao = req.body.taxaEncargoViolacaoInstalacao;
  const taxaAluguerContador = req.body.taxaAluguerContador;

  const createdAt = `${new Date().getDate()}/${
    new Date().getMonth() + 1
  }/${new Date().getFullYear()}`;

  if (taxaDepositoGarantia != null && taxaVistoriaSemTransporte != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM products WHERE id=?",
        [productId],
        (err, rows, fields) => {
          if (err) {
            res
              .status(500)
              .send(JSON.stringify({ success: false, message: err }));
          } else {
            if (rows.length > 0) {
              conn.query(
                "UPDATE products SET taxaDepositoGarantia=?, taxaVistoriaSemTransporte=?, taxaVistoriaComTransporte=?, taxaSubscricaoContrato=?, taxaCorteReligacao=?, taxaAfericaoContador=?, taxaEncargoContadorDanificado=?, taxaAluguerContador=? WHERE id=?",
                [
                  taxaDepositoGarantia,
                  taxaVistoriaSemTransporte,
                  taxaVistoriaComTransporte,
                  taxaSubscricaoContrato,
                  taxaCorteReligacao,
                  taxaAfericaoContador,
                  taxaEncargoContadorDanificado,
                  taxaAluguerContador,
                  productId,
                ],
                (err, updation, fileds) => {
                  if (err) {
                    res
                      .status(500)
                      .send(JSON.stringify({ success: false, message: err }));
                  } else {
                    res.send(
                      JSON.stringify({
                        success: true,
                        message: "Produto actualizado com sucesso",
                      })
                    );
                  }
                }
              );
            } else {
              conn.query(
                "INSERT INTO products (taxaEncargoViolacaoInstalacao, diameter, taxaDepositoGarantia, taxaVistoriaSemTransporte, taxaVistoriaComTransporte, createdAt, taxaSubscricaoContrato, taxaCorteReligacao, taxaAfericaoContador, taxaEncargoContadorDanificado, taxaAluguerContador) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                [
                  taxaEncargoViolacaoInstalacao,
                  diameter,
                  taxaDepositoGarantia,
                  taxaVistoriaSemTransporte,
                  taxaVistoriaComTransporte,
                  createdAt,
                  taxaSubscricaoContrato,
                  taxaCorteReligacao,
                  taxaAfericaoContador,
                  taxaEncargoContadorDanificado,
                  taxaAluguerContador,
                ],
                (err, insert, fields) => {
                  if (err) {
                    res
                      .status(500)
                      .send(JSON.stringify({ success: false, message: err }));
                  } else {
                    res.send(
                      JSON.stringify({
                        success: true,
                        message: "Produto Inserido Com Sucesso",
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
    res.send(JSON.stringify({ success: false, message: "Invalid Request" }));
  }
});

module.exports = router;
