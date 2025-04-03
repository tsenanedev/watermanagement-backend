"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class banks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      banks.hasMany(models.accounts, {
        foreignKey: "bank_id",
        as: "accounts", // Nome da associação
      });
    }
  }
  banks.init(
    {
      name: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "banks",
    }
  );
  return banks;
};
