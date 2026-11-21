"use strict";

const {
  ensureUserSecurityColumns,
  dropUserSecurityColumns,
} = require("../userSecuritySchema");

// The server also runs ensureUserSecurityColumns on start, so this migration
// is only needed when setting up a database with sequelize-cli.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await ensureUserSecurityColumns(queryInterface, Sequelize);
  },

  down: async (queryInterface, Sequelize) => {
    await dropUserSecurityColumns(queryInterface, Sequelize);
  },
};
