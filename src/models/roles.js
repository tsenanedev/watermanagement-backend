"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class roles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      roles.hasMany(models.users, {
        foreignKey: "role_id", // Chave estrangeira que liga Roles a Users
      });
      roles.belongsTo(models.regulators, {
        foreignKey: "table_id",
        constraints: false, // Removemos a restrição para suportar múltiplas tabelas
        // scope: {
        //   table_name: "regulators",
        // },
        as: "regulators",
      });
      roles.belongsTo(models.operators, {
        foreignKey: "table_id",
        constraints: false,
        // scope: { table_name: "operators" },
        as: "operators",
      });
    }
  }
  roles.init(
    {
      name: DataTypes.STRING,
      table_name: DataTypes.STRING,
      table_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "roles",
      // paranoid: true,
      timestamps: true,
    }
  );

  return roles;
};
