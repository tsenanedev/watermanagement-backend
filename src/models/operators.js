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
      operators.hasMany(models.roles, {
        foreignKey: "table_id",
        constraints: false,
        scope: {
          table_name: "operators",
        },
        as: "roles", // Nome da associação
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
    }
  );
  return operators;
};
