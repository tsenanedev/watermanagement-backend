const { ValidationError, UniqueConstraintError } = require("sequelize");

class ResponseHandler {
  // Tratamento centralizado de erros
  static handleError(error, res, customMessage = "Erro na operação") {
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
  static success(res, data, message = "Operação bem sucedida") {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, data, message = "Registro criado com sucesso") {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static paginated(
    res,
    data,
    pagination,
    message = "Dados listados com sucesso"
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
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
