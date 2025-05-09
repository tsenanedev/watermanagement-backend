const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
  TimeoutError,
} = require("sequelize");
const DomainError = require("./errors/DomainError");
class ResponseHandler {
  // Tratamento centralizado de erros
  static handleError(error, res, customMessage = "Erro na operação") {
    // Tratamento de erros de personalizados
    if (error instanceof DomainError) {
      return res.status(error.status).json({
        success: false,
        error: {
          type: error.code,
          message: error.message,
          ...(Object.keys(error.extra).length && { detalhes: error.extra }),
        },
      });
    }
    // Tratamento de erros de validação
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          messages: error.errors.map((e) => e.message),
        },
      });
    }

    // Tratamento de erros de unicidade
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        success: false,
        error: {
          type: "DUPLICATE_ENTRY",
          messages: error.errors.map((e) => e.message),
        },
      });
    }
    // Tratamento de erro de chave estrangeira
    if (error instanceof ForeignKeyConstraintError) {
      return res.status(400).json({
        success: false,
        error: {
          type: "FOREIGN_KEY_CONSTRAINT",
          messages: [
            "Referência inválida: O registro referencia um recurso inexistente.",
          ],
        },
      });
    }

    // Tratamento de erro de conexão recusada
    if (error.code === "ECONNREFUSED") {
      logger.error({
        message: "Conexão recusada com o banco de dados",
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      return res.status(503).json({
        success: false,
        error: {
          type: "DATABASE_CONNECTION_ERROR",
          message: "Serviço indisponível. Tente novamente mais tarde.",
        },
      });
    }

    // Tratamento de erro de timeout
    if (error instanceof TimeoutError) {
      logger.error({
        message: "Timeout na operação com o banco de dados",
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      return res.status(504).json({
        success: false,
        error: {
          type: "REQUEST_TIMEOUT",
          message: "A requisição excedeu o tempo limite.",
        },
      });
    }

    // Tratamento de erro de sintaxe SQL (exemplo para MySQL)
    if (
      error instanceof DatabaseError &&
      error.parent &&
      error.parent.code === "ER_PARSE_ERROR"
    ) {
      logger.error({
        message: "Erro de sintaxe SQL",
        sql: error.sql,
        parameters: error.parameters,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      return res.status(500).json({
        success: false,
        error: {
          type: "SQL_SYNTAX_ERROR",
          message: "Erro interno no processamento da requisição.",
        },
      });
    }
    // Log de erros internos
    logger.error({
      message: error.message,
      stack: error.stack,
      ...(error.sql && {
        sql: error.sql,
        parameters: error.parameters,
      }),
      timestamp: new Date().toISOString(),
    });

    // Resposta genérica para erros não tratados
    return res.status(500).json({
      success: false,
      error: {
        type: "INTERNAL_SERVER_ERROR",
        message: customMessage,
      },
    });
  }

  // Respostas padronizadas
  static success(res, data = null, message = "Operação bem sucedida") {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static notFound(res, entity = "Registro") {
    return res.status(404).json({
      success: false,
      error: {
        type: "NOT_FOUND",
        message: `${entity} não encontrado`,
      },
    });
  }

  static badRequest(res, message = "Requisição inválida") {
    return res.status(400).json({
      success: false,
      error: {
        type: "BAD_REQUEST",
        message,
      },
    });
  }
}

module.exports = ResponseHandler;
