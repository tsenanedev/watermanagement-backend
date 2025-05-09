"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class invoice_items extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  invoice_items.init(
    {
      invoice_id: DataTypes.INTEGER,
      level_name: DataTypes.STRING,
      consumption_from: DataTypes.INTEGER,
      consumption_to: DataTypes.INTEGER,
      units_consumed: DataTypes.DECIMAL(10, 2),
      price: DataTypes.DECIMAL(10, 2),
      subtotal: DataTypes.DECIMAL(10, 2),
    },
    {
      sequelize,
      modelName: "invoice_items",
    }
  );
  return invoice_items;
};
