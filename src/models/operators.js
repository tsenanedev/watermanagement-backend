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
    }
  }
  operators.init(
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
        beforeValidate: (regulator) => {
          // Gera o código AUTOMATICAMENTE (se não existir)
          if (!regulator.code) {
            const prefix = regulator.name
              .substring(0, 3)
              .toUpperCase()
              .replace(/\s+/g, ""); // Remove espaços (ex: "ANV ISA" → "ANV")
            const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
            regulator.code = `${prefix}-${randomNum}`;
          }
        },
      },
    }
  );
  return operators;
};
