"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invoces", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      amount: {
        type: Sequelize.DECIMAL(8, 2),
      },
      due_date: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
      },
      reading_id: {
        type: Sequelize.INTEGER,
      },
      tenant_id: {
        type: Sequelize.INTEGER,
      },
      billing_date: {
        type: Sequelize.DATE,
      },
      availabilityFee: {
        type: Sequelize.DECIMAL(10, 2),
      },
      vat: {
        type: Sequelize.DECIMAL(10, 2),
      },
      excessiveFee: {
        type: Sequelize.DECIMAL(10, 2),
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("invoces");
  },
};
