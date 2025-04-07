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
const port = process.env.PORT || 4000;
// globals.js
const logger = require("./config/logger"); // Importa o logger
global.logger = logger; // Define a variável global
require("dotenv").config();
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
