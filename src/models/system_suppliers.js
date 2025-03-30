"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class system_suppliers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      system_suppliers.belongsTo(models.districts, {
        foreignKey: "district_id",
        as: "districts",
      });
      system_suppliers.hasMany(models.roles, {
        foreignKey: "table_id",
        constraints: false,
        scope: {
          table_name: "system_suppliers",
        },
        as: "roles",
      });
    }
  }
  system_suppliers.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "O nome do operator é obrigatório",
          },
          len: {
            args: [3, 100],
            msg: "O nome deve ter entre 3 e 100 caracteres",
          },
        },
      },
      district_id: DataTypes.INTEGER,
      operator_id: DataTypes.INTEGER,
      account_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "system_suppliers",
    }
  );
  return system_suppliers;
};
