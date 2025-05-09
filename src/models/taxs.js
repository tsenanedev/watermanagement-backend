"use strict";
const { TaxType, CalculationType, TaxOperation } = require("../enums/Enum.js");
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class taxs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  taxs.init(
    {
      tax_type: {
        type: DataTypes.ENUM(...TaxType.getValues()),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      is_active: DataTypes.BOOLEAN,
      calculation_type: {
        type: DataTypes.ENUM(...CalculationType.getValues()),
        defaultValue: CalculationType.defaultValue,
      },
      operation: { type: DataTypes.ENUM(...TaxOperation.getValues()) },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "taxs",
    }
  );
  return taxs;
};
