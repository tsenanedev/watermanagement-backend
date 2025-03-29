'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class operators extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  operators.init({
    name: DataTypes.STRING,
    table_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'operators',
  });
  return operators;
};