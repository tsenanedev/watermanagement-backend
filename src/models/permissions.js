"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class permissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      permissions.belongsToMany(models.regulators, {
        through: "roles_has_permissions",
        foreignKey: "role_id",
        otherKey: "permission_id",
        as: "roles",
      });
    }
  }
  permissions.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // 👈 Ativa a validação de unicidade
      },
    },
    {
      sequelize,
      modelName: "permissions",
    }
  );
  return permissions;
};
