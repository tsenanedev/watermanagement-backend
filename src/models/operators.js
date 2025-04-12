"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class operators extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      operators.hasMany(models.system_suppliers, {
        foreignKey: "operator_id",
        as: "system_suppliers", // Nome da associação
      });
      operators.hasMany(models.contact_persons, {
        foreignKey: "table_id",
        constraints: false,
        scope: {
          table_name: "operators",
        },
        as: "contact_persons",
      });
    }
  }
  operators.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "O nome já está em uso",
        },
        validate: {
          notEmpty: {
            msg: "O nome não pode ser vazio",
          },
          len: {
            args: [3], // O nome deve ter no mínimo 3 caracteres
            msg: "O nome deve ter no mínimo 3 caracteres",
          },
        },
      },
      address: DataTypes.STRING,
      code: {
        type: DataTypes.STRING,
        unique: {
          msg: "Este código já está em uso",
        },
        validate: {
          isUppercase: {
            msg: "O código deve estar em maiúsculas",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "operators",
      paranoid: true,
      hooks: {
        beforeValidate: (operator) => {
          // Gera o código AUTOMATICAMENTE (se não existir)
          if (!operator.code) {
            const prefix = operator.name
              .substring(0, 3)
              .toUpperCase()
              .replace(/\s+/g, ""); // Remove espaços (ex: "ANV ISA" → "ANV")
            const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
            operator.code = `${prefix}-${randomNum}`;
          }
        },
      },
    }
  );
  return operators;
};
