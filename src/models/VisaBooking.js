"use strict";
module.exports = (sequelize, DataTypes) => {
  const VisaBooking = sequelize.define(
    "VisaBooking",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      visaType: {
        type: DataTypes.ENUM("10_DAYS", "30_DAYS"),
        allowNull: false,
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
      tableName: "visa_bookings",
      paranoid: true,
    }
  );

  VisaBooking.associate = function (models) {
    VisaBooking.hasMany(models.VisaTraveller, {
      foreignKey: "visaBookingId",
      as: "travellers",
    });
  };

  return VisaBooking;
};
