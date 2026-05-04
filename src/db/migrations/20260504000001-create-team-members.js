'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('team_members', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      member_type: {
        type: Sequelize.ENUM('leader', 'member'),
        allowNull: false,
        defaultValue: 'member',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      position: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      image_data: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        defaultValue: null,
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('team_members', ['member_type', 'is_active', 'display_order'], {
      name: 'idx_team_members_type_active_order',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('team_members');
  },
};
