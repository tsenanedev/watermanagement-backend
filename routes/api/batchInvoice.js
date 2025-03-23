var SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
var exjwt = require("express-jwt");
const pdf = require("html-pdf");

const billingCalcs = require("../../billingCalcs");

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

async function generatePDF(
  company,
  customerDetails,
  customerReadings,
  customerPastDues,
  facturas,
  branchName
) {
  const pdf = await billingCalcs.generatePDF(
    company,
    customerDetails,
    customerReadings,
    customerPastDues,
    facturas,
    branchName
  );
  return pdf == true ? true : false;
}

router.get("/:id", jwtMW, (req, res, next) => {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }

  const uid = decoded.uid;
  const barcode = req.params.id;

  if (uid != null && barcode != null) {
    pdf
      .create("Meu nome é Leonel Matsinhe", {})
      .toFile("../../uploads/meupdflindao.pdf", (err, response) => {
        if (err) {
          res.send(
            JSON.stringify({ success: false, message: "Error grnerating PDF!" })
          );
        } else {
          res.send(JSON.stringify({ success: true, message: response }));
        }
      });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid Request!" }));
  }
});

router.post("/", jwtMW, async function (req, res, next) {
  var authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  const barcode = req.body.barcode;
  const companyId = req.body.companyId;
  const tariffTypeId = req.body.tariffTypeId;
  const branchName = req.body.branchName;
  console.log(barcode);
  // Initialize Variables
  const customerDetails = [];
  let customerPastDues = 0;
  const customerReadings = [];

  if (barcode != null) {
    req.getConnection((err, conn) => {
      if (err) {
        res.status(500);
        res.send(JSON.stringify({ success: false, message: err.message }));
      } else {
        conn.query(
          "SELECT * FROM customers WHERE barcode=?",
          [barcode],
          (err, customer, fields) => {
            if (err) {
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else {
              if (customer.length > 0) {
                customerDetails.push(customer[0]);
                conn.query(
                  "SELECT * FROM readings WHERE barcode=? AND status=? ORDER BY id DESC",
                  [barcode, "0"],
                  (err, readings, fields) => {
                    if (err) {
                      res.status(500);
                      res.send(
                        JSON.stringify({ success: false, message: err.message })
                      );
                    } else {
                      if (readings.length > 0) {
                        customerReadings.push(readings);
                        conn.query(
                          "SELECT * FROM debts WHERE barcode=? AND status=?",
                          [barcode, 0],
                          (err, pastDues, fields) => {
                            if (err) {
                              res.status(500);
                              res.send(
                                JSON.stringify({
                                  success: false,
                                  message: err.message,
                                })
                              );
                            } else {
                              conn.query(
                                "SELECT * FROM companies WHERE id=?",
                                [companyId],
                                (err, company, fields) => {
                                  if (err) {
                                    res.status(500);
                                    res.send(
                                      JSON.stringify({
                                        success: false,
                                        message: err.message,
                                      })
                                    );
                                  } else {
                                    if (company.length > 0) {
                                      conn.query(
                                        "SELECT * FROM tarrifs WHERE tarrifTypeId=?",
                                        [tariffTypeId],
                                        (err, tariff, fields) => {
                                          if (err) {
                                            res.status(500);
                                            res.send(
                                              JSON.stringify({
                                                success: false,
                                                message: err.message,
                                              })
                                            );
                                          } else {
                                            const billsResponse = [];
                                            for (
                                              let i = 0;
                                              i < readings.length;
                                              i++
                                            ) {
                                              if (
                                                tariffTypeId == 2 &&
                                                readings[i].consumption <= 5
                                              ) {
                                                const facturas =
                                                  billingCalcs.domesticBelowFive(
                                                    readings[i],
                                                    tariff[0]
                                                  );
                                                billsResponse.push(facturas[0]);
                                              } else if (
                                                tariffTypeId == 2 ||
                                                tariffTypeId == 3
                                              ) {
                                                const facturas =
                                                  billingCalcs.domesticAboveFive(
                                                    readings[i],
                                                    tariff[0]
                                                  );
                                                billsResponse.push(facturas[0]);
                                              } else if (tariffTypeId == 1) {
                                                const facturas =
                                                  billingCalcs.fontCalc(
                                                    readings[i],
                                                    tariff[0]
                                                  );
                                                billsResponse.push(facturas[0]);
                                              } else if (tariffTypeId >= 4) {
                                                const facturas =
                                                  billingCalcs.calculatePublicComercialAndIndustrial(
                                                    readings[i],
                                                    tariff[0]
                                                  );
                                                billsResponse.push(facturas[0]);
                                              }
                                              // console.log(billsResponse)
                                            }
                                            // console.log(billsResponse)
                                            customerPastDues = pastDues;

                                            new Promise(
                                              async function (resolve, reject) {
                                                try {
                                                    const generating = await generatePDF(
                                                        company,
                                                        customerDetails,
                                                        customerReadings,
                                                        customerPastDues,
                                                        billsResponse,
                                                        branchName
                                                    );
                                                    console.log(generating);
                                                    res.send(
                                                        JSON.stringify({
                                                            success: true,
                                                            message: "Factura criada com sucesso.",
                                                        })
                                                    );
                                                    resolve(generating);
                                                } catch (err) {
                                                    console.log(err);
                                                    res.send(
                                                        JSON.stringify({
                                                            success: false,
                                                            message: "Houve um erro na criação da factura.",
                                                        })
                                                    );
                                                    reject(err);
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
                                          message: "Empresa inactiva",
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
                            message:
                              "Sem nenhuma leitura registada até o momento.",
                          })
                        );
                      }
                    }
                  }
                );
              } else {
                res.send(
                  JSON.stringify({
                    success: false,
                    message: "Cliente não encontrado!",
                  })
                );
              }
            }
          }
        );
      }
    });
  } else {
    res.send(JSON.stringify({ success: false, message: "Invalid Request!" }));
  }
});

router.get("/:id", (re, res, next) => {
  const barcode = req.params.id;
});

module.exports = router;
