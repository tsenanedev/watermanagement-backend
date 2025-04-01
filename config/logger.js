const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

// Diretório onde os logs serão salvos
const logDirectory = path.join(__dirname, "..", "logs");

// Criar logger
const logger = createLogger({
  level: "info", // Pode ser 'debug', 'warn', 'error', etc.
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Adiciona data/hora nos logs
    format.json() // Salva logs no formato JSON
  ),
  transports: [
    new transports.Console(), // Mostra logs no terminal

    new DailyRotateFile({
      filename: `${logDirectory}/logs-%DATE%.log`, // Nome do ficheiro com a data
      datePattern: "YYYY-MM-DD", // Formato da data
      zippedArchive: true, // Compacta logs antigos
      maxSize: "20m", // Tamanho máximo de cada ficheiro
      maxFiles: "30d", // Mantém logs por 30 dias
    }),
  ],
});

module.exports = logger;
