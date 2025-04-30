"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("readings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      meter_id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: true,
        references: {
          model: "meters", // Nome da tabela referenciada (deve existir)
          key: "id",
        },
        onUpdate: "CASCADE",
      },
      current: {
        type: Sequelize.FLOAT,
      },
      consumption: {
        type: Sequelize.FLOAT,
      },
      last: {
        type: Sequelize.FLOAT,
      },
      forfeit: {
        type: Sequelize.FLOAT,
      },
      reading_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      staffName: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      photo_url: {
        allowNull: true,
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
      createdby_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      updatedby_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tenant_id: {
        type: Sequelize.INTEGER,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("readings");
  },
};
