'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TeamMember extends Model {
    static associate(models) {}
  }

  TeamMember.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      memberType: {
        type: DataTypes.ENUM('leader', 'member'),
        field: 'member_type',
        allowNull: false,
        defaultValue: 'member',
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: 'Bio / description — used for leaders',
      },
      position: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
        comment: 'Job title / role — used for members',
      },
      imageData: {
        type: DataTypes.TEXT('long'),
        field: 'image_data',
        allowNull: true,
        defaultValue: null,
        comment: 'Base64 encoded profile image',
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
      modelName: 'TeamMember',
      tableName: 'team_members',
      timestamps: true,
      underscored: true,
    }
  );

  return TeamMember;
};
