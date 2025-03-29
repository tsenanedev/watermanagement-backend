const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const myConnection = require("express-myconnection");
let forceSsl = require("force-ssl-heroku");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const routes = require("./routes/api");
const app = express();
const port = process.env.PORT || 3000;

// DB configuration
config = require("./db");
let dbOptions = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  port: config.database.port,
  database: config.database.db,
};

// Middleware
app.use(myConnection(mysql, dbOptions, "pool"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type",
    "Authorization"
  );
  next();
});

app.use(forceSsl);

// // Controllers
// const jwtToken = require("./routes/api/jwtController");
// const users = require("./routes/api/users");
// const user_login = require("./routes/api/user_login");
// const company = require("./routes/api/companies");
// const customer = require("./routes/api/customer");
// const customerByBranch = require("./routes/api/customerByBranch");
// const payments = require("./routes/api/payments");
// const debts = require("./routes/api/debts");
// const customer_balance = require("./routes/api/customer_balance");
// const cash_or_pos = require("./routes/api/cash_or_pos");
// const transactions = require("./routes/api/transactions");
// const provinces = require("./routes/api/provinces");
// const branches = require("./routes/api/branches");
// const mpesa = require("./routes/api/mpesa");
// const tarrif = require("./routes/api/tarriftype");
// const searchCustomer = require("./routes/api/searchCustomer");
// const meters = require("./routes/api/meters");
// const readings = require("./routes/api/readings");
// const readingsAndroid = require("./routes/api/readingsAndroid");
// const notification = require("./routes/api/notification");
// const report_range = require("./routes/api/report_range");
// const token = require("./routes/api/token");
// const multipay = require("./routes/api/multipay");
// const searchBranches = require("./routes/api/searchBranches");
// const searchCustomerByIdRange = require("./routes/api/searchCustomerBySerialNumber");
// const simulator = require("./routes/api/simulator");
// const pdfInvoice = require("./routes/api/bank_invoice");
// const importCustomer = require("./routes/api/import_customer");
// const thirdParty = require("./routes/api/thirdParty");
// const invoices = require("./routes/api/invoice");
// const readingList = require("./routes/api/readingList");
// const updateReadings = require("./routes/api/update_readings");
// const cashierPayments = require("./routes/api/cashier_payments");
// const customerReports = require("./routes/api/customer_report");
// const readingsUpdation = require("./routes/api/readings_updation");
// const qrCodeGenerator = require("./routes/api/qrcodeGenerator");
// const customerPayments = require("./routes/api/customer_payment_history");
// const products = require("./routes/api/products");
// const systemReports = require("./routes/api/system_reports");
// const monthlyReport = require("./routes/api/monthlyReport");
// const proformaRoute = require("./routes/api/proformaRoute");
// const relatorioFacturacao = require("./routes/api/relatorioFacturacao");
// const preRegistration = require("./routes/api/pre_registration");

// Usar o arquivo de rotas
app.use("/api", routes); // Definir o prefixo /api para todas as rotas

// Relatorios
// const pgfGenerator = require("./routes/api/pdf_generator");

app.use(function (err, req, res, next) {
  if (err.name === "Unauthorized")
    res
      .status(401)
      .send(
        JSON.stringify({ success: false, message: "Unauthorized request." })
      );
  else next(err);
});

// API Endpoints
// app.use("/api/login-master", jwtToken);
// app.use("/api/users", users);
// app.use("/api/userLogin", user_login);
// app.use("/api/company", company);
// app.use("/api/customer", customer);
// app.use("/api/customer_b", customerByBranch);
// app.use("/api/payments", payments);
// app.use("/api/debt", debts);
// app.use("/api/customer_balance", customer_balance);
// app.use("/api/cash_or_pos", cash_or_pos);
// app.use("/api/transaction", transactions);
// app.use("/api/province", provinces);
// app.use("/api/branch", branches);
// app.use("/api/mpesa", mpesa);
// app.use("/api/tarrif", tarrif);
// app.use("/api/search_customer", searchCustomer);
// app.use("/api/notification", notification);
// app.use("/api/meter", meters);
// app.use("/api/reading", readings);
// app.use("/api/readingsAndroid", readingsAndroid);
// app.use("/api/report_range", report_range);
// app.use("/api/token", token);
// app.use("/api/multipay", multipay);
// app.use("/api/search_branch", searchBranches);
// app.use("/api/search_by_id_range", searchCustomerByIdRange);
// app.use("/api/simulator", simulator);
// app.use("/api/invoice", pdfInvoice);
// app.use("/api/importCustomer", importCustomer);
// app.use("/api/thirdParty", thirdParty);
// app.use("/api/invoices", invoices);
// app.use("/api/readingList", readingList);
// app.use("/api/updateReadings", updateReadings);
// app.use("/api/cashierPayments", cashierPayments);
// app.use("/api/customerReports", customerReports);
// app.use("/api/readingsUpdation", readingsUpdation);
// app.use("/api/generateQrCode", qrCodeGenerator);
// app.use("/api/customerPayments", customerPayments);
// app.use("/api/cashierReport", pgfGenerator);
// app.use("/api/products", products);
// app.use("/api/systemReports", systemReports);
// app.use("/api/generateReport", monthlyReport);
// app.use("/api/proforma", proformaRoute);
// app.use("/api/facturacao", relatorioFacturacao);
// app.use("/api/preRegistration", preRegistration);
// app.use("/api/supportMessages", require("./routes/api/supportMessages"));
// app.use(
//   "/api/customerCredentials",
//   require("./routes/api/customer_credentials")
// );
// app.use("/api/proforma", require("./routes/api/proforma"));
// app.use("/api/proformaPayment", require("./routes/api/proformaPayments"));
// app.use("/api/reportNotes", require("./routes/api/reportNotes"));
// app.use("/api/fraudAlert", require("./routes/api/abnormalConsumption"));
// app.use("/api/billByEmail", require("./routes/api/billByEmail"));
// app.use("/api/whatsapp", require("./routes/api/sendWhatsapMessage"));
// app.use("/api/whatsupport", require("./routes/api/whatsupport"));
// app.use("/api/batchInvoice", require("./routes/api/batchInvoice"));
// app.use("/api/smsService", require("./routes/api/smsService"));
// app.use("/api/prepayVending", require("./routes/api/prepayvending"));
// app.use("/api/mpesa-payment", require("./routes/api/mpesa-payment"));

app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/public/"));
  // Handle Single Page Application
  app.get("/.*/", (req, res) => res.sendFile(__dirname + "/public/index.html"));
} else {
  app.use(express.static("public/"));
}

app.use("/public", express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/reports", express.static("reports"));
app.use("/templates", express.static("templates"));

app.get("/apk", (req, res) =>
  res.sendFile(__dirname + "/reports/app-debug.apk")
);

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/privacy", (req, res) => {
  res.render("privacy");
});

app.get("/mpesa/:id", (req, res) => {
  const barcode = req.params.id;

  if (barcode != null) {
    req.getConnection((err, conn) => {
      if (err) {
        res.status(500);
        res.send(JSON.stringify({ success: false, message: err.message }));
      } else {
        conn.query(
          "SELECT * FROM readings WHERE uniqueBillId=? AND status=? ORDER BY id DESC",
          [barcode, 0],
          (err, rows, fields) => {
            if (err) {
              res.status(500);
              res.send(
                JSON.stringify({ success: false, message: err.message })
              );
            } else {
              console.log(rows);
              res.render("home", {
                readings: rows[0],
              });
            }
          }
        );
      }
    });
  } else {
    res.send(
      JSON.stringify({
        success: false,
        message: "You do not have authorization to vist this page.",
      })
    );
  }
});

app.listen(port, () =>
  console.log(`TsenaneApp Server Started On Port ${port}`)
);
