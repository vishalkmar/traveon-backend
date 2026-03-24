"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if destinationId column already exists
    const blogColumns = await queryInterface.describeTable("blogs");
    if (blogColumns.destinationId) {
      console.log('destinationId column already exists in blogs table, skipping');
      return;
    }

    await queryInterface.addColumn("blogs", "destinationId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "destinations",
        key: "id",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("blogs", "destinationId");
  },
};
