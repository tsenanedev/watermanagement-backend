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
      roles.belongsToMany(models.permissions, {
        through: "roles_has_permissions",
        foreignKey: "role_id",
        otherKey: "permission_id",
        as: "permissions",
      });
      roles.hasMany(models.users, {
        foreignKey: "role_id", // Chave estrangeira que liga Roles a Users
      });
      roles.belongsTo(models.regulators, {
        foreignKey: "table_id",
        constraints: false, // Removemos a restrição para suportar múltiplas tabelas
        as: "regulators",
      });
      roles.belongsTo(models.system_suppliers, {
        foreignKey: "table_id",
        constraints: false,
        as: "system_suppliers",
      });
    }
  }
  roles.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT, // ou DataTypes.STRING
        allowNull: true, // Permite valores nulos (opcional)
      },
      table_name: {
        type: DataTypes.STRING,
        allowNull: false, // Campo obrigatório
      },
      table_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Campo obrigatório
      },
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
