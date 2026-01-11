"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Roles",
      [
        {
          roleName: "Admin",
          accessIDs: null,
          note: "Full access to all modules",
          status: "Active",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          roleName: "User",
          accessIDs: null,
          note: "User Role",
          status: "Active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      {}
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Roles", null, {});
  },
};