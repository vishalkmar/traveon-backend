'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('image_banners', 'redirect_url', {
      type: Sequelize.STRING(2000),
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('image_banners', 'redirect_url');
  },
};
