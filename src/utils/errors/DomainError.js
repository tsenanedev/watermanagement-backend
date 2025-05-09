class DomainError extends Error {
  constructor(message, code = "DOMAIN_ERROR", status = 400, extra = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.extra = extra;
  }
}

module.exports = DomainError;
