// Enum.js
class Enum {
  constructor(values, defaultValue) {
    this.values = values;
    this.defaultValue = defaultValue || values[0];
    values.forEach((value) => {
      this[value] = value;
    });
    Object.freeze(this);
  }

  isValid(value) {
    return this.values.includes(value);
  }

  getValues() {
    return [...this.values];
  }
}

// Tipos específicos
const TaxType = new Enum(["IVA", "DEDUCAO_DIVIDA", "OUTRO"], "IVA");

const CalculationType = new Enum(["PERCENTAGEM", "FIXO"], "PERCENTAGEM");
const IvoiceStatus = new Enum(
  ["BILLED", "PAID", "OVERDUE", "REJECTED"],
  "BILLED"
);
const TaxOperation = new Enum(["INCREMENTO", "DEDUCAO"], "INCREMENTO");
Object.freeze(TaxType);
Object.freeze(CalculationType);
Object.freeze(IvoiceStatus);
Object.freeze(TaxOperation);
module.exports = {
  TaxType,
  CalculationType,
  IvoiceStatus,
  TaxOperation,
};
