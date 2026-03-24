'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if images column already exists
    const blogColumns = await queryInterface.describeTable('blogs');
    if (blogColumns.images) {
      console.log('images column already exists in blogs table, skipping');
      return;
    }

    await queryInterface.addColumn('blogs', 'images', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('blogs', 'images');
  },
};
