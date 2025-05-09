"use strict";
const { TaxType, CalculationType ,TaxOperation} = require("../enums/Enum");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("taxs", [
      {
        tax_type: TaxType.IVA,
        name: "IVA",
        value: 17.0,
        calculation_type: CalculationType.PERCENTAGEM,
        is_active: true,
        description: "Imposto sobre Valor Acrescentado",
            operation:TaxOperation.INCREMENTO,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tax_type: TaxType.DEDUCAO_DIVIDA,
        name: "Dedução da Divida",
        value: 50.0,
        calculation_type: CalculationType.PERCENTAGEM,
        description: "Dedução por pagamento antecipado",
        operation:TaxOperation.DEDUCAO,
        is_active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("taxs", null, {});
  },
};
