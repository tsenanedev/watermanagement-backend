// errors/CustomrsErrors.js
const DomainError = require("./DomainError");

class CustomrsErrors extends DomainError {
  static customerNotFound(message) {
    return new CustomrsErrors(message, "CUSTOMER_NOT_FOUND", 400);
  }
}

// Agora, exportamos funções diretamente
module.exports = {
  customerNotFound: CustomrsErrors.customerNotFound,
};
