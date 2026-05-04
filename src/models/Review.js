'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {}
  }

  Review.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: { min: 1, max: 5 },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      imageData: {
        type: DataTypes.TEXT('medium'),
        field: 'image_data',
        allowNull: true,
        defaultValue: null,
        comment: 'Base64 encoded avatar image',
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        field: 'display_order',
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        field: 'is_active',
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Review',
      tableName: 'reviews',
      timestamps: true,
      underscored: true,
    }
  );

  return Review;
};
