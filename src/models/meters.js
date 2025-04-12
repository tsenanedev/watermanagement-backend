"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class meters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  meters.init(
    {
      tenant_id: DataTypes.INTEGER,
      number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      local_instalacao: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "meters",
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
  return meters;
};
