"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class system_suppliers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      system_suppliers.hasMany(models.contact_persons, {
        foreignKey: "table_id",
        constraints: false,
        scope: {
          table_name: "system_suppliers",
        },
        as: "contact_persons",
      });
      system_suppliers.belongsTo(models.operators, {
        foreignKey: "operator_id",
        as: "operators",
      });
      system_suppliers.belongsTo(models.districts, {
        foreignKey: "district_id",
        as: "districts",
      });
      system_suppliers.hasMany(models.roles, {
        foreignKey: "table_id",
        constraints: false,
        scope: {
          table_name: "system_suppliers",
        },
        as: "roles",
      });
    }
  }
  system_suppliers.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "Já existe um sistema de abastecimento com este nome.",
        },
        validate: {
          notEmpty: {
            msg: "O nome do sistema de abastecimento é obrigatório",
          },
          notNull: {
            msg: "O nome do sistema de abastecimento é obrigatório",
          },
          len: {
            args: [3, 100],
            msg: "O nome deve ter entre 3 e 100 caracteres",
          },
        },
      },
      operator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "O campo operador é obrigatório.",
          },
          notNull: {
            msg: "O campo operador é obrigatório.",
          },
        },
      },
      district_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "O campo distrito é obrigatório.",
          },
          notEmpty: {
            msg: "O campo distrito não pode estar vazio.",
          },
          async isValidDistrict(value) {
            if (value) {
              const exists = await sequelize.models.districts.findByPk(value);
              if (!exists) {
                throw new Error("O distrito especificada não existe.");
              }
            }
          },
        },
      },
      address: DataTypes.STRING,
      logo: DataTypes.STRING,
      nuit: DataTypes.STRING,
      account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          async isValidAccount(value) {
            if (value) {
              const exists = await sequelize.models.accounts.findByPk(value);
              if (!exists) {
                throw new Error("A conta bancária especificada não existe.");
              }
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "system_suppliers",
    }
  );
  return system_suppliers;
};
