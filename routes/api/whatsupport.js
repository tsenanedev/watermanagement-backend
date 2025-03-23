const SECRET_KEY = "leonelMatsinheRestFullApiFOrMatiAppWeb1865375hdyt";
const whatsAppCloudApi = require("../../whatsAppCloudApi");
const formatMoney = require("../../calcs/MoneyFormat");

const express = require("express");
const router = express.Router();

const whatsappMenu = `
Bem vindo à *TSENANE LDA*
*1.* Facturas pendentes  
*2.* Extracto de pagamentos
*Linha Verde:* +258863132801
*Baixar Aplicativo:* https://bit.ly/3aBHdtf
`;

const internalServerError = (from) => {
  return {
    messaging_product: "whatsapp",
    to: from,
    type: "text",
    text: {
      body: `Lamentamos! Não foi possível processar o seu pedido neste momento.\nVolte tentar mais tarde.\nPara assitência contacte: *+258863132801*`,
    },
  };
};

const pendingBillsUnavailable = (from) => {
  return {
    messaging_product: "whatsapp",
    to: from,
    type: "text",
    text: {
      body: `De momento não tem nenhuma factura em aberto.`,
    },
  };
};

const pendingPaymentsUnavailable = (from) => {
  return {
    messaging_product: "whatsapp",
    to: from,
    type: "text",
    text: {
      body: `Pagamentos indisponíveis.`,
    },
  };
};

const getPaymentMethod = (method) => {
  if (method == 1) {
    return "Boca do Caixa";
  } else if (method == 2) {
    return "Depósito Bancário";
  } else if (method == 3) {
    return "Transferência Bancária";
  } else if (method == 4) {
    return "POS";
  } else if (method == 5) {
    return "Cheque";
  } else if (method == 6) {
    return "SISTAFE";
  } else if (method == 7) {
    return "M-Pesa Open API";
  } else if (method == 8) {
    return "E-Mola";
  }
};

const customerPayments = (payments, from) => {
  let transactions = [];

  payments.forEach((payment) => {
    let paymentDetail;
    paymentDetail = "--------------------------------------\n";

    paymentDetail += "*Factura/Recibo Nº: " + payment.billId + "*\n";
    paymentDetail += "Data/Pagt: " + payment.dateOfPayment + "\n";
    paymentDetail += "Referência: " + payment.reference + "\n";
    paymentDetail +=
      "M/Pagamento: " + getPaymentMethod(payment.paymentMethod) + "\n";
    paymentDetail += "*MONTANTE: " + formatMoney(payment.totalPaid) + "*\n";

    payments.length - 1 == payments.indexOf(payment)
      ? (paymentDetail += "===========================\n")
      : (paymentDetail += "");

    transactions.push({ payment: paymentDetail });
  });

  let dadosPagamento = "";

  transactions.forEach((payment) => {
    dadosPagamento += payment.payment;
  });

  const values = {
    messaging_product: "whatsapp",
    to: from,
    type: "text",
    text: {
      body: `*Extrato de pagamentos:* *${payments.length}*\n${dadosPagamento}`,
    },
  };
  return values;
};

const pendingBills = (readings, from) => {
  // TODO => process pending bills
  let billDetailsFacturas = [];

  readings.forEach((factura) => {
    let facturaDetail;
    facturaDetail = "--------------------------------------\n";
    facturaDetail += "*Factura/Recibo Nº: " + factura.receiptNumber + "*\n";
    facturaDetail += "Data de emissão: " + factura.dataEmissao + "\n";
    facturaDetail += "Vencimento: " + factura.dataLimite + "\n";
    facturaDetail += "Leitura anterior: " + factura.last + " m^3\n";
    facturaDetail += "Leitura actual: " + factura.current + " m^3\n";
    facturaDetail +=
      "Consumo facturado: " + factura.consumoFacturado + " m^3\n";
    facturaDetail += "SubTotal: " + formatMoney(factura.subTotal) + "\n";
    facturaDetail +=
      "IVA (12%): " + formatMoney(factura.subTotal * 0.16) + "\n";
    facturaDetail += "Multa: " + formatMoney(factura.forfeit) + "\n";
    facturaDetail +=
      "*Total da factura: " + formatMoney(factura.totalOfBill) + "*\n";

    readings.length - 1 == readings.indexOf(factura)
      ? (facturaDetail += "===========================\n")
      : "";

    // console.log(pendingBills.length - 1, pendingBills.indexOf(factura));
    billDetailsFacturas.push({ factura: facturaDetail });
  });

  const totalOfBill = readings.reduce(function (acumulador, factura) {
    return acumulador + factura.totalOfBill;
  }, 0);

  const grandTotal = `\n*TOTAL A PAGAR: ${formatMoney(totalOfBill)}*`;

  let dadosFacturas = "";

  billDetailsFacturas.forEach((bill) => {
    dadosFacturas += bill.factura;
  });

  const values = {
    messaging_product: "whatsapp",
    to: from,
    type: "text",
    text: {
      body: `*FACTURAS PENDENTES:* *${readings.length}*\n${dadosFacturas}${grandTotal}`,
    },
  };
  return values;
};

router.get("/", (req, res, next) => {
  const request = req.query;
  console.log(request);

  res.send(request["hub.challenge"]);
});

router.post("/", (req, res, next) => {
  const body_param = req.body;

  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0] &&
      body_param.entry[0].changes[0].value.messages[0].text
    ) {
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let body = body_param.entry[0].changes[0].value.messages[0].text.body;

      let passingValues;

      req.getConnection(async (err, conn) => {
        if (err) {
          console.log("DATABASE_ERROR:", err);
          res.status(201);
        } else {
          conn.query(
            "SELECT * FROM customers WHERE phone=? LIMIT 1",
            [from],
            async (err, rows, fields) => {
              if (err) {
                try {
                  await whatsAppCloudApi.sendWhatsApp(
                    internalServerError(from)
                  );
                  // console.log(sendMessage);
                  res.status(200).send();
                } catch (err) {
                  console.log(err);
                  res.status(204).send();
                }
              } else {
                if (rows.length > 0) {
                  const customer = rows[0];
                  if (body == "1") {
                    console.log("SHOWING CUSTOMER PENDING BILLS");
                    conn.query(
                      "UPDATE customers SET whatsapp=? WHERE barcode=?",
                      [1, customer.barcode]
                    );
                    conn.query(
                      "SELECT * FROM readings WHERE barcode=? AND status=?",
                      [customer.barcode, 0],
                      async (err, readings, fields) => {
                        if (err) {
                          try {
                            await whatsAppCloudApi.sendWhatsApp(
                              internalServerError
                            );
                            // console.log(sendMessage);
                            res.status(200).send();
                          } catch (err) {
                            console.log(err);
                            res.status(204).send();
                          }
                        } else {
                          if (readings.length > 0) {
                            try {
                              await whatsAppCloudApi.sendWhatsApp(
                                pendingBills(readings, from)
                              );
                              // console.log(sendMessage);
                              res.status(200).send();
                            } catch (err) {
                              console.log(err);
                              res.status(204).send();
                            }
                          } else {
                            try {
                              await whatsAppCloudApi.sendWhatsApp(
                                pendingBillsUnavailable(from)
                              );
                              // console.log(sendMessage);
                              res.status(200).send();
                            } catch (err) {
                              console.log(err);
                              res.status(204).send();
                            }
                          }
                        }
                      }
                    );
                    res.status(200).send();
                  } else if (body == "2") {
                    console.log("SHOWING CUSTOMER STATEMENT");
                    conn.query(
                      "SELECT * FROM payments WHERE barcode=? ORDER BY id DESC",
                      [customer.barcode],
                      async (err, payments, fields) => {
                        if (err) {
                          try {
                            await whatsAppCloudApi.sendWhatsApp(
                              internalServerError
                            );
                            res.status(200).send();
                          } catch (err) {
                            console.log(err);
                            res.status(204).send();
                          }
                        } else {
                          if (payments.length > 0) {
                            try {
                              await whatsAppCloudApi.sendWhatsApp(
                                customerPayments(payments, from)
                              );
                              // console.log(sendMessage);
                              res.status(200).send();
                            } catch (err) {
                              console.log(err);
                              res.status(204).send();
                            }
                          } else {
                            try {
                              await whatsAppCloudApi.sendWhatsApp(
                                pendingPaymentsUnavailable(from)
                              );
                              // console.log(sendMessage);
                              res.status(200).send();
                            } catch (err) {
                              console.log(err);
                              res.status(204).send();
                            }
                          }
                        }
                      }
                    );
                  } else {
                    passingValues = {
                      messaging_product: "whatsapp",
                      to: from,
                      type: "text",
                      text: {
                        body: `Olá *${customer.name}*\n` + whatsappMenu,
                      },
                    };
                    try {
                      await whatsAppCloudApi.sendWhatsApp(passingValues);
                      // console.log(sendMessage);
                      res.status(200).send();
                    } catch (err) {
                      console.log(err);
                      res.status(204).send();
                    }
                  }
                } else {
                  const passingValues = {
                    messaging_product: "whatsapp",
                    to: from,
                    type: "text",
                    text: {
                      body: `O número +${from} não está associado a nenhuma conta de água.\nPara assitência contacte: *+258863132801*`,
                    },
                  };
                  try {
                    await whatsAppCloudApi.sendWhatsApp(passingValues);
                    console.log(passingValues);
                    res.status(200).send();
                  } catch (err) {
                    console.log(err);
                    res.status(204).send(err);
                  }
                }
              }
            }
          );
        }
      });
    } else {
      console.log("Not User initiated Conversation.");
      res.status(201).send();
    }
  } else {
    console.log("Not WhatsappCloudAPI sending messages.");
    res.status(201).send();
  }
});

module.exports = router;
