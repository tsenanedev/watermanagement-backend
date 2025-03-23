let SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const express = require("express");
const router = express.Router();
let jwt = require("jsonwebtoken");
let exjwt = require("express-jwt");
const moment = require("moment");
const fetch = require("node-fetch");
const axios = require("axios");

const smsUrl = process.env.TEXT_LOCAL_URL;
const smsApiKey = process.env.TEXT_LOCAL_API_KEY;
const smsSender = process.env.TEXT_LOCAL_SENDER;

const jwtMW = exjwt({
  secret: SECRET_KEY,
});

router.post("/", jwtMW, (req, res, next) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }

  const amountPaid = parseFloat(req.body.amountPaid);
  const phoneNumber = req.body.phoneNumber;
  const paymentReference = req.body.paymentReference.toUpperCase();
  const receiptNumber = req.body.receiptNumber;
  const createdAt = moment().format("YYYY-MM-DD");

  if (
    amountPaid != null &&
    phoneNumber != null &&
    paymentReference != null &&
    receiptNumber != null
  ) {
    req.getConnection(function (err, conn) {
      if (err) {
        res
          .status(500)
          .send(JSON.stringify({ success: false, message: err.message }));
      } else {
        if (receiptNumber.length == 11) {
          // Start API call to Stron Vending System
          const prePaidBodyParameters = {
            CompanyName: process.env.STRON_COMPANY_NAME,
            UserName: process.env.STRON_USER_NAME,
            PassWord: process.env.STRON_PASSWORD,
            MeterId: receiptNumber,
            is_vend_by_unit: "false",
            Amount: amountPaid.toString(),
          };
          fetch(`${process.env.STRON_API_URL}VendingMeter`, {
            method: "POST",
            body: JSON.stringify(prePaidBodyParameters),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.length == 1 && json[0].Token.length == 24) {
                // const purchase = json[0];
                const smsBody = `${json[0].Customer_name}
                ${json[0].Customer_address}.
                RECARGA DE AGUA:
                ${json[0].Token}
                CONTADOR: ${json[0].Meter_id}
                VOLUME: ${json[0].Total_unit} ${json[0].Unit}.
                TOTAL PAGO: ${json[0].Total_paid} MZN`;

                axios
                  .post(smsUrl, {
                    apiKey: smsApiKey,
                    numbers: phoneNumber,
                    smsBody: smsBody,
                    sender: smsSender,
                  })
                  .then((response) => {
                    res.status(200).send(
                      JSON.stringify({
                        success: true,
                        result: json,
                        smsResponse: response,
                      })
                    );
                  })
                  .catch((err) => {
                    console.log(err);
                    res.send(JSON.stringify({ success: false, message: err }));
                  });
              } else {
                res.status(403).send(
                  JSON.stringify({
                    success: false,
                    message: "Invalid reference.",
                  })
                );
              }
            })
            .catch((err) =>
              res
                .status(500)
                .send(JSON.stringify({ success: false, message: err }))
            );
        } else {
          conn.query(
            "SELECT * FROM readings WHERE receiptNumber=?",
            [receiptNumber],
            (err, rows, fields) => {
              if (err) {
                res
                  .status(500)
                  .send(
                    JSON.stringify({ success: false, message: err.message })
                  );
              } else {
                if (rows.length == 1) {
                  const bill = rows[0];
                  if (bill.status == 0) {
                    if (bill.totalOfBill == amountPaid) {
                      // Make the payment
                      conn.query(
                        "INSERT INTO payments (customerName, barcode, tarrifTypeId, totalPaid, billId, reference, phoneNumber, smsDetails, staffName, paymentMethod, dateOfPayment, createdAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                        [
                          bill.barcode,
                          bill.barcode,
                          bill.tarrifTypeId,
                          amountPaid,
                          receiptNumber,
                          paymentReference,
                          phoneNumber,
                          "M-Pesa USSD",
                          "M-Pesa USSD",
                          7,
                          createdAt,
                          createdAt,
                        ],
                        (err, insertion, fields) => {
                          if (err) {
                            res.status(500).send(
                              JSON.stringify({
                                success: false,
                                message: err.message,
                              })
                            );
                          } else {
                            conn.query(
                              "UPDATE readings SET status=? WHERE receiptNumber=?",
                              [1, receiptNumber],
                              (err, update, fields) => {
                                if (err) {
                                  res.status(500).send(
                                    JSON.stringify({
                                      success: false,
                                      message: err.message,
                                    })
                                  );
                                } else {
                                  res.status(200).send(
                                    JSON.stringify({
                                      success: true,
                                      message:
                                        "The payment was successfully processed.",
                                    })
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    } else if (bill.totalOfBill > amountPaid) {
                      res.status(402).send(
                        JSON.stringify({
                          success: false,
                          message: "Insufficient amount.",
                        })
                      );
                    } else if (bill.totalOfBill < amountPaid) {
                      res.status(402).send(
                        JSON.stringify({
                          success: false,
                          message:
                            "The amount paid is greater than the invoice amount.",
                        })
                      );
                    }
                  } else {
                    // The Bill has been paid
                    res.status(208).send(
                      JSON.stringify({
                        success: false,
                        message: "The bill has already been paid.",
                      })
                    );
                  }
                } else {
                  // Reference Payment Not Valid
                  res.status(208).send(
                    JSON.stringify({
                      success: false,
                      message: "Invalid reference.",
                    })
                  );
                }
              }
            }
          );
        }
      }
    });
  } else {
    res.send(
      JSON.stringify({
        success: false,
        message: "All the parameters must be filled.",
      })
    );
  }
});

module.exports = router;
