"use strict";
module.exports = (sequelize, DataTypes) => {
  const TourBooking = sequelize.define(
    "TourBooking",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      contactName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      numberOfTravellers: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        defaultValue: "PENDING",
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "tour_bookings",
      paranoid: true,
    }
  );

  TourBooking.associate = function (models) {
    TourBooking.hasMany(models.TourTraveller, {
      foreignKey: "tourBookingId",
      as: "travellers",
    });
  };

  return TourBooking;
};
