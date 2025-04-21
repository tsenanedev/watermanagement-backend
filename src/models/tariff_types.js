'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tariff_types extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tariff_types.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tariff_types',
  });
  return tariff_types;
};