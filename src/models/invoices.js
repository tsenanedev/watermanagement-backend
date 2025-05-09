"use strict";
const { Model } = require("sequelize");
const { IvoiceStatus } = require("../enums/Enum.js");
module.exports = (sequelize, DataTypes) => {
  class invoices extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  invoices.init(
    {
      amount: DataTypes.DECIMAL(8, 2),
      due_date: DataTypes.DATE,
      status: DataTypes.ENUM(...IvoiceStatus.getValues()), // Estados em inglês
      reading_id: DataTypes.INTEGER,
      tenant_id: DataTypes.INTEGER,
      billing_date: DataTypes.DATE,
      availabilityFee: DataTypes.DECIMAL(10, 2),
      vat: DataTypes.DECIMAL(10, 2),
      excessiveFee: DataTypes.DECIMAL(10, 2),
      subtotal: DataTypes.DECIMAL(10, 2),
      total: DataTypes.DECIMAL(10, 2),
    },
    {
      sequelize,
      modelName: "invoices",
      scopes: {
        tenant(tenantId) {
          if (tenantId == null) {
            return {};
          }
          return {
            where: { tenant_id: tenantId },
          };
        },
      },
    }
  );
  return invoices;
};
