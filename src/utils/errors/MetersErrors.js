// errors/MetersErrors.js
const DomainError = require("./DomainError");

class MetersErrors extends DomainError {
  // Erro de leitura menor que a anterior
  static meterNotFound(message) {
    return new MetersErrors(message, "METER_NOT_FOUND", 400);
  }

  // Erro de leitura não aprovada
  static clientAlreadyHasMeter(message) {
    return new MetersErrors(message, "CLIENT_ALREADY_HAS_METER", 400);
  }

  // Erro de leitura com valor inválido
  static meterInUseByAnotherClient(message) {
    return new MetersErrors(
      message,
      "INVALID_RMETER_IN_USE_BY_ANOTHER_CLIENTEADING_VALUE",
      400
    );
  }
}

// Agora, exportamos funções diretamente
module.exports = {
  clientAlreadyHasMeter: MetersErrors.clientAlreadyHasMeter,
  meterNotFound: MetersErrors.meterNotFound,
  meterInUseByAnotherClient: MetersErrors.meterInUseByAnotherClient,
};
