'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('package_configs', 'flow_string', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: 'Custom WhatsApp pre-filled message for this package',
      after: 'is_top_selling',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('package_configs', 'flow_string');
  },
};
