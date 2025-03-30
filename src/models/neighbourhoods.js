"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class neighbourhoods extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      neighbourhoods.belongsTo(models.districts, {
        foreignKey: "districts_id",
        as: "districts",
      });
    }
  }
  neighbourhoods.init(
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
      districts_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "neighbourhoods",
    }
  );
  return neighbourhoods;
};
