"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("invoice_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "invoces", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      level_name: {
        type: Sequelize.STRING,
      },
      consumption_from: {
        type: Sequelize.INTEGER,
      },
      consumption_to: {
        type: Sequelize.INTEGER,
      },
      units_consumed: {
        type: Sequelize.DECIMAL(10, 2),
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
      },
      subtotal: {
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
    await queryInterface.dropTable("invoice_items");
  },
};
