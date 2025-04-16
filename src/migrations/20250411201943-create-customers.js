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
      meter_id: {
        type: Sequelize.INTEGER,
        unique: true,
        references: {
          model: "meters", // Nome da tabela referenciada (deve existir)
          key: "id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      nuit: {
        type: Sequelize.STRING,
        unique: true,
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("customers");
  },
};
