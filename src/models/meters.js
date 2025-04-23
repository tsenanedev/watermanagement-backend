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
      number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      diameter: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tenant_id: DataTypes.INTEGER,
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
