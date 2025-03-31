"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class districts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      districts.belongsTo(models.provinces, {
        foreignKey: "province_id",
        as: "provinces",
      });
      districts.hasMany(models.neighbourhoods, {
        foreignKey: "districts_id",
        as: "neighbourhoods",
      });
    }
  }
  districts.init(
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
      province_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "districts",
    }
  );
  return districts;
};
