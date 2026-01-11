"use strict";

module.exports = (sequelize, DataTypes) => {
  const ContactQuery = sequelize.define(
    "ContactQuery",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("NEW", "READ", "REPLIED"),
        defaultValue: "NEW",
      },
    },
    {
      timestamps: true,
      tableName: "contact_queries",
    }
  );

  return ContactQuery;
};
