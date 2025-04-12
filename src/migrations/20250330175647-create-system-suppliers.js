"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("system_suppliers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      district_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "districts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      operator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "operators",
          key: "id",
        },
        onUpdate: "CASCADE",
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "accounts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      address: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      logo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      nuit: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex("system_suppliers", ["name"], {
      unique: true,
      name: "unique_system_supplier_name",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("system_suppliers");
  },
};
