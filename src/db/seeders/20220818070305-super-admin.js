"use strict";
import PasswordHashing from "../../utils/password-hashing";

async function hashedPassword() {
  let hash = await PasswordHashing.hash("Retreats@2025");
  return hash;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          userId: "SA0001",
          firstName: "Super",
          lastName: "Admin",
          emailAddress: "retreatsbytraveon@gmail.com",
          emailVerified: true,
          phoneNumber: 9876543210,
          phoneVerified: true,
          userPassword: await hashedPassword(),
          otpCode: null,
          token: null,
          lastLogin: null,
          userRole: 1,
          userType: "Admin",
          status: "Active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      {}
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
