/**
 * Two-factor columns on `users`.
 *
 * Idempotent: only adds the columns that are missing, so it is safe to run on
 * every server start (cPanel has no convenient place to run migrations) and
 * from the migration file alike.
 */
function securityColumns(Sequelize) {
  return {
    totpEnabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    totpSecret: { type: Sequelize.TEXT, allowNull: true }, // AES-GCM encrypted
    totpPendingSecret: { type: Sequelize.TEXT, allowNull: true }, // during setup
    totpLastStep: { type: Sequelize.BIGINT, allowNull: true }, // blocks code replay
    emailOtpEnabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    emailOtpAddress: { type: Sequelize.STRING, allowNull: true },
    emailOtpPendingAddress: { type: Sequelize.STRING, allowNull: true },
    otpCodeHash: { type: Sequelize.STRING(128), allowNull: true },
    otpPurpose: { type: Sequelize.STRING(32), allowNull: true },
    otpExpiresAt: { type: Sequelize.DATE, allowNull: true },
    otpSentAt: { type: Sequelize.DATE, allowNull: true },
    otpAttempts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
  };
}

async function ensureUserSecurityColumns(queryInterface, Sequelize) {
  const existing = await queryInterface.describeTable("users");
  const added = [];
  for (const [name, definition] of Object.entries(securityColumns(Sequelize))) {
    if (!existing[name]) {
      await queryInterface.addColumn("users", name, definition);
      added.push(name);
    }
  }
  return added;
}

async function dropUserSecurityColumns(queryInterface, Sequelize) {
  const existing = await queryInterface.describeTable("users");
  for (const name of Object.keys(securityColumns(Sequelize))) {
    if (existing[name]) await queryInterface.removeColumn("users", name);
  }
}

module.exports = { ensureUserSecurityColumns, dropUserSecurityColumns };
