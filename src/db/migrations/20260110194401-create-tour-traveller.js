"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tour_travellers", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      tourBookingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "tour_bookings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      passportScanUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      photoUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      panCardUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      aadharCardUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      flightBookingUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tour_travellers");
  },
};
