"use strict";
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    return queryInterface.bulkInsert("users", [
      {
        id: uuidv4(),
        username: "Traveon",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", { username: "Traveon" }, {});
  },
};
