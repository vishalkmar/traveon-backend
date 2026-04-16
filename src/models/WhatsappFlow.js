'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WhatsappFlow extends Model {
    static associate(models) {}
  }

  WhatsappFlow.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      flowMessage: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Pre-filled WhatsApp message when user clicks',
      },
      imageData: {
        type: DataTypes.TEXT('medium'),
        allowNull: true,
        comment: 'Base64 encoded image data URI',
      },
      phoneNumber: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: 'WhatsApp phone number with country code, no + or spaces',
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Lower number = shown first',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'WhatsappFlow',
      tableName: 'whatsapp_flows',
      timestamps: true,
      underscored: true,
    }
  );

  return WhatsappFlow;
};
