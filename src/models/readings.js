"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class readings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      readings.belongsTo(models.users, {
        foreignKey: "createdby_id",
        as: "createdBy",
      });

      readings.belongsTo(models.users, {
        foreignKey: "updatedby_id",
        as: "updatedBy",
      });

      readings.belongsTo(models.meters, {
        foreignKey: "meter_id",
        as: "meter",
      });
    }
  }
  readings.init(
    {
      current: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "A leitura atual não pode ser negativa",
          },
        },
      },
      consumption: {
        type: DataTypes.FLOAT,
        validate: {
          min: {
            args: [0],
            msg: "Consumo não pode ser negativo",
          },
        },
      },
      last: {
        type: DataTypes.FLOAT,
        comment: "Última leitura registrada",
      },
      forfeit: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      reading_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        validate: {
          isIn: {
            args: [["pending", "approved", "rejected"]],
            msg: "Status inválido",
          },
        },
      },
      staffName: {
        type: DataTypes.STRING,
        comment: "Nome do operador responsável",
      },
      photo_url: {
        type: DataTypes.STRING,
        validate: {
          isUrl: {
            msg: "URL da foto inválida",
          },
        },
      },
      createdby_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      updatedby_id: {
        type: DataTypes.INTEGER,
      },
      tenant_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "readings",
      indexes: [
        {
          fields: ["reading_date"],
        },
        {
          fields: ["status"],
        },
      ],
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
  return readings;
};
