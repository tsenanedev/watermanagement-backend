'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class roles_has_permissions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  roles_has_permissions.init({
    roles_id: DataTypes.INTEGER,
    permissions_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'roles_has_permissions',
  });
  return roles_has_permissions;
};