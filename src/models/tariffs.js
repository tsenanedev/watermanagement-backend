"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tariffs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tariffs.init(
    {
      tariff_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      system_supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      availability_fee: DataTypes.DECIMAL(10, 2),
      level_name: DataTypes.STRING,
      consumption_from: DataTypes.INTEGER,
      consumption_to: DataTypes.INTEGER,
      price: DataTypes.DECIMAL(10, 2),
      unit_type: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
      valid_from: DataTypes.DATEONLY,
      valid_to: DataTypes.DATEONLY,
    },
    {
      sequelize,
      modelName: "tariffs",
    }
  );
  return tariffs;
};
