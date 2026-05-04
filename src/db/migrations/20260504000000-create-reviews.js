'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      image_data: {
        type: Sequelize.TEXT('medium'),
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

    await queryInterface.addIndex('reviews', ['is_active', 'display_order'], {
      name: 'idx_reviews_active_order',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('reviews');
  },
};
