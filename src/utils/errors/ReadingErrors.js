// errors/ReadingErrors.js
const DomainError = require("./DomainError");

class ReadingErrors extends DomainError {
  static readingNotFound(message) {
    return new ReadingErrors(message, "READING_NOT_FOUND", 400);
  }
  static readingLessThanPrevious(message) {
    return new ReadingErrors(message, "READING_LESS_THAN_PREVIOUS", 400);
  }

  // Erro de leitura não aprovada
  static readingNotApproved(message) {
    return new ReadingErrors(message, "READING_NOT_APPROVED", 400);
  }

  // Erro de leitura com valor inválido
  static meterInUseByAnotherClient(message) {
    return new ReadingErrors(message, "METER_IN_USE_BY_ANOTHER_CLIENT", 400);
  }
}

// Agora, exportamos funções diretamente
module.exports = {
  readingLessThanPrevious: ReadingErrors.readingLessThanPrevious,
  readingNotApproved: ReadingErrors.readingNotApproved,
  readingNotApproved: ReadingErrors.readingNotApproved,
  readingNotFound: ReadingErrors.readingNotFound,
  meterInUseByAnotherClient: ReadingErrors.meterInUseByAnotherClient,
};
