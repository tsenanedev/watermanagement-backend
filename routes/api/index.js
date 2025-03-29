const express = require("express");
const router = express.Router();

// Importar todas as rotas
const regulatorsController = require("../../src/Controllers/regulatorsController");
const operatorsControllers = require("../../src/Controllers/operatorsControllers");
const authController = require("../../src/Controllers/authController");

const jwtToken = require("./jwtController");

const users = require("./users");
const company = require("./companies");
const customer = require("./customer");
const customerByBranch = require("./customerByBranch");
const payments = require("./payments");
const debts = require("./debts");
const customer_balance = require("./customer_balance");
const cash_or_pos = require("./cash_or_pos");
const transactions = require("./transactions");
const provinces = require("./provinces");
const branches = require("./branches");
const mpesa = require("./mpesa");
const tarrif = require("./tarriftype");
const searchCustomer = require("./searchCustomer");
const meters = require("./meters");
const readings = require("./readings");
const readingsAndroid = require("./readingsAndroid");
const notification = require("./notification");
const report_range = require("./report_range");
const token = require("./token");
const multipay = require("./multipay");
const searchBranches = require("./searchBranches");
const searchCustomerByIdRange = require("./searchCustomerBySerialNumber");
const simulator = require("./simulator");
const pdfInvoice = require("./bank_invoice");
const importCustomer = require("./import_customer");
const thirdParty = require("./thirdParty");
const invoices = require("./invoice");
const readingList = require("./readingList");
const updateReadings = require("./update_readings");
const cashierPayments = require("./cashier_payments");
const customerReports = require("./customer_report");
const readingsUpdation = require("./readings_updation");
const qrCodeGenerator = require("./qrcodeGenerator");
const customerPayments = require("./customer_payment_history");
const products = require("./products");
const systemReports = require("./system_reports");
const monthlyReport = require("./monthlyReport");
const proformaRoute = require("./proformaRoute");
const relatorioFacturacao = require("./relatorioFacturacao");
const preRegistration = require("./pre_registration");
const pgfGenerator = require("./pdf_generator");

// Registrar todas as rotas com seus respectivos prefixos
router.use("/jwt", jwtToken);
router.use("/users", users);
// CRUD regulators
router.post("/regulators", regulatorsController.create);
router.get("/regulators", regulatorsController.findAll);
router.get("/regulators/:id", regulatorsController.findOne);
router.put("/regulators/:id", regulatorsController.update);
router.delete("/regulators/:id", regulatorsController.delete);
// CRUD regulators
router.post("/operators", operatorsControllers.create);
router.get("/operators", operatorsControllers.findAll);
router.get("/operators/:id", operatorsControllers.findOne);
router.put("/operators/:id", operatorsControllers.update);
router.delete("/operators/:id", operatorsControllers.delete);
//login user
router.post("/userLogin", authController.login);
router.post("/users/chenge/pass", authController.updatePassword);

// router.use("/user_login", user_login);
router.use("/companies", company);
router.use("/customers", customer);
router.use("/customersByBranch", customerByBranch);
router.use("/payments", payments);
router.use("/debts", debts);
router.use("/customer_balance", customer_balance);
router.use("/cash_or_pos", cash_or_pos);
router.use("/transactions", transactions);
router.use("/provinces", provinces);
router.use("/branches", branches);
router.use("/mpesa", mpesa);
router.use("/tarrif", tarrif);
router.use("/searchCustomer", searchCustomer);
router.use("/meters", meters);
router.use("/readings", readings);
router.use("/readingsAndroid", readingsAndroid);
router.use("/notification", notification);
router.use("/report_range", report_range);
router.use("/token", token);
router.use("/multipay", multipay);
router.use("/searchBranches", searchBranches);
router.use("/searchCustomerByIdRange", searchCustomerByIdRange);
router.use("/simulator", simulator);
router.use("/bank_invoice", pdfInvoice);
router.use("/import_customer", importCustomer);
router.use("/thirdParty", thirdParty);
router.use("/invoices", invoices);
router.use("/readingList", readingList);
router.use("/update_readings", updateReadings);
router.use("/cashier_payments", cashierPayments);
router.use("/customer_report", customerReports);
router.use("/readings_updation", readingsUpdation);
router.use("/qrcodeGenerator", qrCodeGenerator);
router.use("/customer_payment_history", customerPayments);
router.use("/products", products);
router.use("/system_reports", systemReports);
router.use("/monthlyReport", monthlyReport);
router.use("/proformaRoute", proformaRoute);
router.use("/relatorioFacturacao", relatorioFacturacao);
router.use("/pre_registration", preRegistration);
router.use("/pdf_generator", pgfGenerator);

module.exports = router;
