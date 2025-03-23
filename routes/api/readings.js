const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");
const moment = require("moment");

const billingCalcs = require("../../billingCalcs");

var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

// Fetch billsByUid
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

  if (uid != null && branchId != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM readings WHERE status=? AND branchId=? ORDER BY id",
        [-1, branchId],
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
                  message:
                    "Nenhuma leitura por validar no bairro seleccionado até o momento!",
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

// Fetch all bills by companyId
router.get("/:id/:tariffId", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  let customerId = req.params.id;
  let tarrifTypeId = req.params.tariffId;

  if (customerId != null && uid != null && tarrifTypeId != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "SELECT * FROM tarrifs WHERE tarrifTypeId=?",
        [tarrifTypeId],
        function (err, rows, fields) {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length > 0) {
              const tariff = rows[0];
              req.getConnection(function (err, conn) {
                conn.query(
                  "SELECT * FROM readings WHERE barcode=? ORDER BY id DESC",
                  [customerId],
                  function (err, bills, fields) {
                    if (err) {
                      res.status(500);
                      res.send(
                        JSON.stringify({ success: false, message: err.message })
                      );
                    } else {
                      if (bills.length > 0) {
                        const billsResponse = [];
                        for (let i = 0; i < bills.length; i++) {
                          if (tarrifTypeId == 2 && bills[i].consumption <= 5) {
                            const facturas = billingCalcs.domesticBelowFive(
                              bills[i],
                              rows[0]
                            );
                            billsResponse.push(facturas[0]);
                          } else if (tarrifTypeId == 2 || tarrifTypeId == 3) {
                            const facturas = billingCalcs.domesticAboveFive(
                              bills[i],
                              rows[0]
                            );
                            billsResponse.push(facturas[0]);
                          } else if (tarrifTypeId == 1) {
                            const facturas = billingCalcs.fontCalc(
                              bills[i],
                              rows[0]
                            );
                            billsResponse.push(facturas[0]);
                          } else if (tarrifTypeId >= 4) {
                            const facturas =
                              billingCalcs.calculatePublicComercialAndIndustrial(
                                bills[i],
                                rows[0]
                              );
                            billsResponse.push(facturas[0]);
                          }
                        }
                        const customerFacturas = bills.filter((a) => {
                          return a.status == 0;
                        });
                        const totalFacturas = customerFacturas.reduce(function (
                          acumulador,
                          valorAtual
                        ) {
                          return acumulador + valorAtual.totalOfBill;
                        },
                        0);
                        res.send(
                          JSON.stringify({
                            success: true,
                            result: bills,
                            facturas: billsResponse,
                            totalFacturas,
                          })
                        );
                      } else {
                        res.send(
                          JSON.stringify({
                            success: false,
                            message:
                              "Nenhuma factura disponível até o momento!",
                          })
                        );
                      }
                    }
                  }
                );
              });
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Company ID not available in our database!",
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

router.put("/", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  const last = req.body.last;
  const current = req.body.current;
  const consumption = req.body.consumption;
  const updatedBy = req.body.updatedBy;
  const lat = req.body.lat;
  const lng = req.body.lng;
  const id = req.body.id;

  if (uid != null) {
    if (id == 0) {
      const barcode = req.body.barcode;
      const vat = req.body.vat;
      const subTotal = req.body.subTotal;
      const totalOfBill = req.body.totalOfBill;
      const readingId = req.body.readingId;
      console.log(vat, subTotal, totalOfBill, readingId);

      req.getConnection(function (err, conn) {
        conn.query(
          "UPDATE readings SET subTotal=?, vat=?, totalOfBill=?, lat=?, lng=? WHERE receiptNumber=? AND year=? AND tariffId =?",
          [subTotal, vat, totalOfBill, lat, lng, readingId, 2023, 2],
          (err, rows, fields) => {
            if (err) {
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else {
              if (rows.affectedRows > 0) {
                conn.query(
                  "UPDATE customers SET readingStatus=? WHERE barcode=?",
                  [10, barcode],
                  (err, readings, fields) => {
                    if (err) {
                      res.status(500);
                      res.send(
                        JSON.stringify({ success: false, message: err.message })
                      );
                    }
                    res.send(
                      JSON.stringify({
                        success: true,
                        message: "Leitura actualizada com sucesso",
                      })
                    );
                  }
                );
              } else {
                res.send(
                  JSON.stringify({
                    success: false,
                    message: "Ocorreu um erro na actualização da leitura!",
                  })
                );
              }
            }
          }
        );
      });
    } else {
      req.getConnection(function (err, conn) {
        conn.query(
          "UPDATE readings SET current=?, last=?, consumption=?, consumoFacturado=?, updatedBy=? WHERE id=?",
          [current, last, consumption, consumption, updatedBy, id],
          (err, rows, fields) => {
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
                    message: "Leitura actualizada com sucesso",
                  })
                );
              } else {
                res.send(
                  JSON.stringify({
                    success: false,
                    message: "Ocorreu um erro na actualização da leitura!",
                  })
                );
              }
            }
          }
        );
      });
    }
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

router.patch("/", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;
  const { current, consumption, consumoFacturado, status, id } = req.body;

  if (uid != null && id != null) {
    req.getConnection(function (err, conn) {
      conn.query(
        "UPDATE readings SET current=?, status=?, consumption=?, consumoFacturado=? WHERE id=?",
        [current, status, consumption, consumoFacturado, id],
        (err, rows, fields) => {
          if (err) {
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.affectedRows > 0) {
              res.send(
                JSON.stringify({
                  success: true,
                  message: "Leitura actualizada com sucesso.",
                })
              );
            } else {
              res.send(
                JSON.stringify({
                  success: true,
                  message: "Houve um erro na validação da leitura.",
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

// Delete Billing
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
        "DELETE FROM readings WHERE id=?",
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
                  message: "Leitura excluída com sucesso",
                })
              );
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Ocorreu um erro ao excluir esta leitura!",
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

// Add bill
router.post("/", jwtMW, (req, res, next) => {
  const barcode = req.body.barcode;
  const branchId = req.body.branchId;
  const last = req.body.last;
  const current = req.body.current;
  const consumption = req.body.consumption;
  const status = req.body.status;
  const staffName = req.body.staffName;
  const lat = req.body.lat;
  const lng = req.body.lng;
  const waterMeterImageUrl = req.body.waterMeterImageUrl;
  const month = new Date().getMonth();
  const month_1 = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const uniqueBill = barcode + "_0" + month_1 + "_" + year;
  const createdAt = moment().format("YYYY-MM-DD");
  const takenAt = moment().format("YYYY-05-15");
  const tarrifTypeId = req.body.tarrifTypeId;
  const consumoFacturado = req.body.consumoFacturado;
  const dataEmissao = moment().format("YYYY-MM-DD");
  const dataLimite = moment().format("YYYY-MM-") + moment().daysInMonth();
  const tariffId = 2;

  if (staffName != null && current != null) {
    req.getConnection(function (err, conn) {
      // console.log(barcode)
      conn.query(
        "SELECT * FROM readings WHERE barcode=? AND uniqueBillId=?",
        [barcode, uniqueBill],
        function (err, rows, fields) {
          if (err) {
            console.log(err.message);
            res.status(500);
            res.send(JSON.stringify({ success: false, message: err.message }));
          } else {
            if (rows.length == 0) {
              conn.query(
                "SELECT MAX(receiptNumber) AS maxReceiptNumber FROM readings",
                [],
                (err, rows, fields) => {
                  if (err) {
                    console.log(err.message);
                    res.status(500);
                    res.send(
                      JSON.stringify({ success: false, message: err.message })
                    );
                  } else {
                    const maxReceipt = rows[0].maxReceiptNumber + 1;
                    conn.query(
                      "INSERT INTO readings(tariffId, dataEmissao, dataLimite, barcode, receiptNumber, branchId, uniqueBillId, consumption, current, last, forfeit, month, year, createdAt, staffName, status, takenAt, consumptionPeriod, consumoFacturado, tarrifTypeId, waterMeterImageUrl, lat, lng) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                      [
                        tariffId,
                        dataEmissao,
                        dataLimite,
                        barcode,
                        maxReceipt,
                        branchId,
                        uniqueBill,
                        consumption,
                        current,
                        last,
                        0,
                        month,
                        year,
                        dataEmissao,
                        staffName,
                        status,
                        takenAt,
                        takenAt,
                        consumoFacturado,
                        tarrifTypeId,
                        waterMeterImageUrl,
                        lat,
                        lng,
                      ],
                      function (err, rows, fields) {
                        if (err) {
                          console.log(err.message);
                          res.status(500);
                          res.send(
                            JSON.stringify({
                              success: false,
                              message: err.message,
                            })
                          );
                        } else {
                          if (rows.affectedRows > 0) {
                            res.send(
                              JSON.stringify({
                                success: true,
                                message: "Leitura submetida com sucesso.",
                              })
                            );
                          }
                        }
                      }
                    );
                  }
                }
              );
            } else {
              res.send(
                JSON.stringify({
                  success: false,
                  message: "A leitura deste cliente já foi submitida.",
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

module.exports = router;
