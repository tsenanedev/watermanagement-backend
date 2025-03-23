let SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";

const express = require("express");
const router = express.Router();
let jwt = require("jsonwebtoken");
let exjwt = require("express-jwt");
const mpesa = require("mpesa-node-api");
const moment = require("moment");
const requestIp = require("request-ip");

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
  const amount = req.body.amount;
  const msidn = req.body.phoneNumber;
  const transactionRef = req.body.transactionRef;
  const thirdPartyRef = req.body.thirdPartyRef;
  const billId = req.body.billId;
  const paymentMethod = req.body.paymentMethod;
  const tarrifTypeId = req.body.tarrifTypeId;
  const staffName = req.body.staffName;
  const customerName = req.body.customerName;
  const createdAt = moment().format("YYYY-MM-DD");
  console.log(createdAt);
  // const createdAt = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`

  const smsDetails = `Registamos uma operacao de pagamento de agua no valor de ${amount} MZN. Obrigado pela preferencia.`;

  if (
    amount != null &&
    msidn != null &&
    transactionRef != null &&
    thirdPartyRef != null
  ) {
    const clientIp = requestIp.getClientIp(req);
    console.log("IP Address" + clientIp);
    req.getConnection(function (err, conn) {
      if (err) {
        res
          .status(500)
          .send(JSON.stringify({ success: false, message: err.message }));
      } else {
        mpesa
          .initiate_c2b(
            /* amount */ amount,
            /* msisdn */ msidn,
            /* transaction ref */ transactionRef,
            /*3rd party ref*/ thirdPartyRef
          )
          .then(function (response) {
            // logging the response
            if (
              response.output_ResponseDesc == "Request processed successfully"
            ) {
              const conversationId = response.output_ConversationID;
              console.log(response);
              const reference = response.output_TransactionID;
              conn.query(
                "INSERT INTO payments (customerName, barcode, tarrifTypeId, totalPaid, billId, reference, phoneNumber, smsDetails, staffName, paymentMethod, dateOfPayment, createdAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                  customerName,
                  thirdPartyRef,
                  tarrifTypeId,
                  amount,
                  billId,
                  reference,
                  msidn,
                  smsDetails,
                  staffName,
                  paymentMethod,
                  createdAt,
                  createdAt,
                ],
                (err, rows, fields) => {
                  if (err) {
                    console.log(err.message);
                    res
                      .status(500)
                      .send(
                        JSON.stringify({ success: false, message: err.message })
                      );
                  } else {
                    conn.query(
                      "UPDATE readings SET status=? WHERE receiptNumber=?",
                      [1, billId],
                      (err, rows, fields) => {
                        if (err) {
                          res.status(500);
                          console.log(err.message);
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
                              message: "Pagamento submetido com sucesso!",
                            })
                          );
                        }
                      }
                    );
                  }
                }
              );
            } else {
              console.log(response);
              res.send(
                JSON.stringify({
                  success: false,
                  message: "Ocorreu um erro, volte tentar mais tarde.",
                })
              );
            }
          })
          .catch(function (error) {
            // TODO: handle errors
            console.log(error);
            res
              .status(500)
              .send(JSON.stringify({ success: false, message: error }));
          });
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

router.put("/", jwtMW, (req, res, next) => {
  let authorization = req.headers.authorization,
    decoded;
  try {
    decoded = jwt.verify(authorization.split(" ")[1], SECRET_KEY);
  } catch (e) {
    return res.status(401).send("unauthorized");
  }
  const uid = decoded.uid;

  const query_reference = req.body.transactionRef;

  if (uid != null && query_reference != null) {
    mpesa.initializeApi({
      baseUrl: process.env.MPESA_API_HOST,
      apiKey: process.env.MPESA_API_KEY,
      publicKey: process.env.MPESA_PUBLIC_KEY,
      origin: process.env.MPESA_ORIGIN,
      serviceProviderCode: 901029,
    });

    mpesa
      .query_transaction_status(query_reference)
      .then((response) => {
        res.send(JSON.stringify({ success: true, result: response }));
      })
      .catch((err) => {
        res.send(JSON.stringify({ success: false, message: err }));
      });
  } else {
    res
      .status(204)
      .send(JSON.stringify({ success: false, message: "Invalid request" }));
  }
});

module.exports = router;
