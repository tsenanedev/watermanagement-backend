"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("taxs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      tax_type: {
        type: Sequelize.STRING,
      },
      value: {
        type: Sequelize.FLOAT,
      },
      calculation_type: {
        type: Sequelize.STRING,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      operation: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("taxs");
  },
};
