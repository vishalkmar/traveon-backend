"use strict";
module.exports = (sequelize, DataTypes) => {
  const TourTraveller = sequelize.define(
    "TourTraveller",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tourBookingId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passportScanUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      panCardUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aadharCardUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flightBookingUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "tour_travellers",
    }
  );

  TourTraveller.associate = function (models) {
    TourTraveller.belongsTo(models.TourBooking, {
      foreignKey: "tourBookingId",
    });
  };

  return TourTraveller;
};
