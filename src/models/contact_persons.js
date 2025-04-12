"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class contact_persons extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      contact_persons.belongsTo(models.operators, {
        foreignKey: "table_id",
        constraints: false,
        as: "operators",
      });
      contact_persons.belongsTo(models.system_suppliers, {
        foreignKey: "table_id",
        constraints: false,
        as: "system_suppliers",
      });
      contact_persons.belongsTo(models.regulators, {
        foreignKey: "table_id",
        constraints: false,
        as: "regulators",
      });
    }
  }
  contact_persons.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "O nome da pessoa de contacto não pode ser vazio",
          },
          len: {
            args: [3],
            msg: "O nome da pessoa de contacto deve ter no mínimo 3 caracteres",
          },
        },
      },
      phone_number: {
        type: DataTypes.STRING,
        validate: {
          is: {
            // Expressão regular para validar no mínimo 9 dígitos numéricos
            args: /^[0-9]{9,}$/, // Pelo menos 9 dígitos numéricos
            msg: "O número de telefone deve conter no mínimo 9 dígitos",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: {
            msg: "O e-mail fornecido não é válido",
          },
        },
      },
      table_name: DataTypes.STRING,
      table_id: DataTypes.INTEGER,
      paranoid: true,
    },
    {
      sequelize,
      modelName: "contact_persons",
    }
  );
  return contact_persons;
};
