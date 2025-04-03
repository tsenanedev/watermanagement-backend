"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class accounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      accounts.belongsTo(models.banks, {
        foreignKey: "bank_id",
        as: "banks",
      });
    }
  }
  accounts.init(
    {
      bank_id: DataTypes.INTEGER,
      accountNumber: DataTypes.STRING,
      nib: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "accounts",
    }
  );
  return accounts;
};
