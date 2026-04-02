'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PackageConfig extends Model {
    static associate(models) {
      // association can be defined here
      this.belongsTo(models.Package, { foreignKey: 'packageId', targetKey: 'id' });
    }
  }
  PackageConfig.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    packageId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'packages',
        key: 'id',
      },
    },
    gtxPkgId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    packageName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    countriesId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    minPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    maxPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'true = enabled, false = disabled'
    },
    disabledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    enabledAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PackageConfig',
    tableName: 'package_configs',
    timestamps: true,
    underscored: true
  });
  return PackageConfig;
};
