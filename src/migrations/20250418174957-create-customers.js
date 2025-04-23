"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("customers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      barcode: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      telephone: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      tenant_id: {
        type: Sequelize.INTEGER,
      },

      nuit: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      lat: {
        type: Sequelize.STRING,
      },
      lng: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      whatsapp: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      meter_id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: true,
        references: {
          model: "meters", // Nome da tabela referenciada (deve existir)
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      tariff_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "tarrif_types", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      system_supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "system_suppliers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      neighbourhood_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "neighbourhoods", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("customers");
  },
};
