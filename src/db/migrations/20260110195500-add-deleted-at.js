"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if deletedAt column exists in tour_bookings before adding
    const tourBookingColumns = await queryInterface.describeTable("tour_bookings");
    if (!tourBookingColumns.deletedAt) {
      await queryInterface.addColumn("tour_bookings", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // Check if deletedAt column exists in visa_bookings before adding
    const visaBookingColumns = await queryInterface.describeTable("visa_bookings");
    if (!visaBookingColumns.deletedAt) {
      await queryInterface.addColumn("visa_bookings", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tour_bookings", "deletedAt");
    await queryInterface.removeColumn("visa_bookings", "deletedAt");
  },
};
