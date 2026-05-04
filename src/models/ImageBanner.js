'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ImageBanner extends Model {
    static associate(models) {}
  }

  ImageBanner.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      imageData: {
        type: DataTypes.TEXT('medium'),
        allowNull: false,
        comment: 'Base64 encoded image data URI',
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Lower number = shown first in slider',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      redirectUrl: {
        type: DataTypes.STRING(2000),
        field: 'redirect_url',
        allowNull: true,
        defaultValue: null,
        comment: 'Optional URL to redirect to when banner is clicked',
      },
    },
    {
      sequelize,
      modelName: 'ImageBanner',
      tableName: 'image_banners',
      timestamps: true,
      underscored: true,
    }
  );

  return ImageBanner;
};
