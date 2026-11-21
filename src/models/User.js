"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "user"),
        allowNull: false,
        defaultValue: "user",
      },

      // ── Two-factor authentication (see src/db/userSecuritySchema.js) ──
      totpEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      totpSecret: { type: DataTypes.TEXT, allowNull: true },
      totpPendingSecret: { type: DataTypes.TEXT, allowNull: true },
      totpLastStep: { type: DataTypes.BIGINT, allowNull: true },
      emailOtpEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      emailOtpAddress: { type: DataTypes.STRING, allowNull: true },
      emailOtpPendingAddress: { type: DataTypes.STRING, allowNull: true },
      otpCodeHash: { type: DataTypes.STRING(128), allowNull: true },
      otpPurpose: { type: DataTypes.STRING(32), allowNull: true },
      otpExpiresAt: { type: DataTypes.DATE, allowNull: true },
      otpSentAt: { type: DataTypes.DATE, allowNull: true },
      otpAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
