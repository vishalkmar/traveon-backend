const { Sequelize } = require("sequelize");
const config = require("../config/database").development;
const { User } = require("../models");
const bcrypt = require("bcrypt");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false,
  }
);

async function initAdmin() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    const adminUser = await User.findOne({ where: { username: "admin" } });
    if (adminUser) {
      console.log("Admin user already exists.");
    } else {
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin user created successfully.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

initAdmin();
