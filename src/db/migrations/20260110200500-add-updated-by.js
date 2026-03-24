"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if updatedBy column exists in tour_bookings before adding
    const tourBookingColumns = await queryInterface.describeTable("tour_bookings");
    if (!tourBookingColumns.updatedBy) {
      await queryInterface.addColumn("tour_bookings", "updatedBy", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Check if updatedBy column exists in visa_bookings before adding
    const visaBookingColumns = await queryInterface.describeTable("visa_bookings");
    if (!visaBookingColumns.updatedBy) {
      await queryInterface.addColumn("visa_bookings", "updatedBy", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tour_bookings", "updatedBy");
    await queryInterface.removeColumn("visa_bookings", "updatedBy");
  },
};
