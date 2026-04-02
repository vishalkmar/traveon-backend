'use strict';

/**
 * This migration is DEPRECATED.
 * The package_id column is now created as CHAR(36) UUID in the initial migration.
 * Keeping this file as a no-op to maintain migration history.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // No-op: package_id is already CHAR(36) from initial migration
  },

  async down(queryInterface, Sequelize) {
    // No-op: Do not modify the migration history
  }
};
