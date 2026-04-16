'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('whatsapp_flows', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      flow_message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      image_data: {
        type: Sequelize.TEXT('medium'),
        allowNull: true,
      },
      phone_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
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

    await queryInterface.addIndex('whatsapp_flows', ['is_active', 'display_order'], {
      name: 'idx_whatsapp_flows_active_order',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('whatsapp_flows');
  },
};
