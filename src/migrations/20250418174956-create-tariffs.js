"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tariffs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      level_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      consumption_from: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      consumption_to: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      unit_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      availability_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      valid_from: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      valid_to: {
        type: Sequelize.DATEONLY,
      },
      system_supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "system_suppliers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      tariff_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "tarrif_types", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tariffs");
  },
};
