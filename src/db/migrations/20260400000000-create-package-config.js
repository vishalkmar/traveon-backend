'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('package_configs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      package_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
        references: {
          model: 'packages',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      gtx_pkg_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      package_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      countries_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      min_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      max_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'true = enabled, false = disabled'
      },
      disabled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      enabled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Add index for faster queries
    await queryInterface.addIndex('package_configs', ['gtx_pkg_id']);
    await queryInterface.addIndex('package_configs', ['is_enabled']);
    await queryInterface.addIndex('package_configs', ['countries_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('package_configs');
  }
};
