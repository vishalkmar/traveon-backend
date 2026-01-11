"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tour_bookings", "updatedBy", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("visa_bookings", "updatedBy", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tour_bookings", "updatedBy");
    await queryInterface.removeColumn("visa_bookings", "updatedBy");
  },
};
