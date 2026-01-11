"use strict";
module.exports = (sequelize, DataTypes) => {
  const VisaTraveller = sequelize.define(
    "VisaTraveller",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      visaBookingId: {
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
    },
    {
      tableName: "visa_travellers",
    }
  );

  VisaTraveller.associate = function (models) {
    VisaTraveller.belongsTo(models.VisaBooking, {
      foreignKey: "visaBookingId",
    });
  };

  return VisaTraveller;
};
