"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class customers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      customers.belongsTo(models.meters, {
        foreignKey: "meter_id",
        as: "meters",
      });
    }
  }
  customers.init(
    {
      barcode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          args: true,
          msg: "O nome já está em uso",
        },
        validate: {
          notEmpty: {
            msg: "O nome do cliente é obrigatório",
          },
          notNull: {
            msg: "O nomedo cliente é obrigatório",
          },
          len: {
            args: [3, 100],
            msg: "O nome deve ter entre 3 e 100 caracteres",
          },
        },
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "O campo telefone é obrigatório",
          },
          notNull: {
            msg: "O campo telefone é obrigatório",
          },
          is: {
            // Expressão regular para validar no mínimo 9 dígitos numéricos
            args: /^[0-9]{9,}$/,
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
      tariff_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "O campo tarifa é obrigatório.",
          },
          notNull: {
            msg: "O campo tarifa é obrigatório.",
          },
        },
      },
      system_supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        notEmpty: {
          msg: "Informe o Sistema de Abastecimento .",
        },
        notNull: {
          msg: "Informe o Sistema de Abastecimento.",
        },
      },
      meter_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: {
          args: true,
          msg: "O Contador já está em uso",
        },
        async isValidMeter(value) {
          if (value) {
            const exists = await sequelize.models.meters.findByPk(value);
            if (!exists) {
              throw new Error("O contador especificada não existe.");
            }
          }
        },
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      nuit: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: {
          args: true,
          msg: "O nuit já está em uso",
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lat: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lng: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      whatsapp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      neighbourhood_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "customers",
      scopes: {
        system_supplier(tenantId) {
          if (tenantId == null) {
            return {};
          }
          return {
            where: { system_supplier_id: tenantId },
          };
        },
      },
    }
  );
  return customers;
};
