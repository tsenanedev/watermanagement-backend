// Enum.js
class Enum {
  constructor(values, defaultValue) {
    this.values = values;
    this.defaultValue = defaultValue || values[0];
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
const TaxType = new Enum(
  ["IVA", "DEDUCAO_DIVIDA", "TAXA_MUNICIPAL", "TAXA_AMBIENTAL", "OUTRO"],
  "IVA"
);

const CalculationType = new Enum(["PERCENTAGEM", "FIXO"], "PERCENTAGEM");
module.exports = {
  TaxType,
  CalculationType,
};
Object.freeze(TaxType);
Object.freeze(CalculationType);
