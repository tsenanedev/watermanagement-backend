const express = require("express");
const router = express.Router();

// Importar todas as rotas
const {
  hasPermission,
  hasRole,
} = require("../../src/middlewares/authorization");
const regulatorsController = require("../../src/Controllers/regulatorsController");
const operatorsControllers = require("../../src/Controllers/operatorsController");
const provincesController = require("../../src/Controllers/provincesController");
const systemSuppliersController = require("../../src/Controllers/systemSuppliersController");
const authController = require("../../src/Controllers/authController");
const permissionsController = require("../../src/Controllers/permissionsController");
const rolesController = require("../../src/Controllers/rolesController");
const authMiddleware = require("../../src/middlewares/authMiddleware");
const metersController = require("../../src/Controllers/metersController");
const districtsController = require("../../src/Controllers/districtsController");

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

router.get(
  "/permissions",
  authMiddleware,
  hasPermission("permissions-findAll"),
  permissionsController.findAll
);
// CRUD meters
router.post(
  "/meters",
  authMiddleware,
  hasPermission("meters-findAll"),
  metersController.create
);
router.get(
  "/meters",
  authMiddleware,
  hasPermission("meters-findAll"),
  metersController.findAll
);
router.get(
  "/meters/:id",
  authMiddleware,
  hasPermission("meters-findAll"),
  metersController.findOne
);
router.put(
  "/meters/:id",
  authMiddleware,
  hasPermission("meters-findAll"),
  metersController.update
);
router.delete("/meters/:id", metersController.delete);
// CRUD roles
router.post(
  "/roles",
  authMiddleware,
  hasPermission("roles-create"),
  rolesController.create
);
router.get(
  "/roles",
  authMiddleware,
  hasPermission("roles-findAll"),
  rolesController.findAll
);
router.get(
  "/roles/:id",
  authMiddleware,
  hasPermission("roles-findOne"),
  rolesController.findOne
);
router.put(
  "/roles/:id",
  authMiddleware,
  hasPermission("roles-update"),
  rolesController.update
);
router.delete(
  "/roles/:id",
  authMiddleware,
  hasPermission("roles-delete"),
  rolesController.delete
);
// CRUD regulators
router.post(
  "/regulators",
  authMiddleware,
  hasPermission("regulators-create"),
  regulatorsController.create
);
router.get(
  "/regulators",
  authMiddleware,
  hasPermission("regulators-findAll"),
  regulatorsController.findAll
);
router.get(
  "/regulators/:id",
  authMiddleware,
  hasPermission("regulators-findOne"),
  regulatorsController.findOne
);
router.put(
  "/regulators/:id",
  authMiddleware,
  hasPermission("regulators-update"),
  regulatorsController.update
);
router.delete(
  "/regulators/:id",
  authMiddleware,
  hasPermission("regulators-delete"),
  regulatorsController.delete
);
// CRUD regulators
router.post(
  "/operators",
  authMiddleware,
  hasPermission("operators-create"),
  operatorsControllers.create
);
router.get(
  "/operators",
  authMiddleware,
  hasPermission("operators-findAll"),
  operatorsControllers.findAll
);
router.get(
  "/operators/:id",
  authMiddleware,
  hasPermission("operators-findOne"),
  operatorsControllers.findOne
);
router.put(
  "/operators/:id",
  authMiddleware,
  hasPermission("operators-update"),
  operatorsControllers.update
);
router.delete(
  "/operators/:id",
  authMiddleware,
  hasPermission("operators-delete"),
  operatorsControllers.delete
);
// CRUD provinces
router.post("/provinces", authMiddleware, provincesController.create);
router.get("/provinces", authMiddleware, provincesController.findAll);
router.get("/provinces/:id", authMiddleware, provincesController.findOne);
router.put("/provinces/:id", authMiddleware, provincesController.update);
router.delete("/provinces/:id", provincesController.delete);
// CRUD districts
router.post("/districts", authMiddleware, districtsController.create);
router.get(
  "/districts/:province_id",
  authMiddleware,
  districtsController.findAll
);
router.put("/districts/:id", authMiddleware, districtsController.update);
router.delete("/districts/:id", authMiddleware, districtsController.delete);
// CRUD system_suppliers
router.post(
  "/system_suppliers",
  authMiddleware,
  hasPermission("systemSuppliers-create"),
  systemSuppliersController.create
);
router.get(
  "/system_suppliers",
  authMiddleware,
  hasPermission("systemSuppliers-findAll"),
  systemSuppliersController.findAll
);
router.get(
  "/system_suppliers/:id",
  authMiddleware,
  hasPermission("systemSuppliers-findOne"),
  systemSuppliersController.findOne
);
router.put(
  "/system_suppliers/:id",
  authMiddleware,
  hasPermission("systemSuppliers-delete"),
  systemSuppliersController.update
);
router.delete(
  "/system_suppliers/:id",
  authMiddleware,
  hasPermission("systemSuppliers-delete"),
  systemSuppliersController.delete
);
//login user
router.post("/userLogin", authController.login);
router.get("/checkToken", authController.checkToken);
router.post(
  "/users/chenge/pass",
  authMiddleware,
  authController.updatePassword
);

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
