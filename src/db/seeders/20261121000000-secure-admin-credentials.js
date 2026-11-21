"use strict";
/**
 * Replaces the old weak admin login (Traveon / Admin@123) with the credentials
 * from .env:  ADMIN_USERNAME, ADMIN_PASSWORD
 *
 * Run once:
 *   npm run seed:admin
 *
 * Safe to run again: it updates the existing admin instead of adding a new one.
 * The legacy "Traveon" account is renamed, so there is only one admin.
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const LEGACY_USERNAME = "Traveon";

function readCredentials() {
  const username = String(process.env.ADMIN_USERNAME || "").trim();
  const password = String(process.env.ADMIN_PASSWORD || "");
  if (!username || !password) {
    throw new Error("Set ADMIN_USERNAME and ADMIN_PASSWORD in .env before running this seeder.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }
  return { username, password };
}

module.exports = {
  up: async (queryInterface) => {
    const { username, password } = readCredentials();
    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();

    const existingId = await queryInterface.rawSelect("users", { where: { username } }, ["id"]);
    const legacyId = await queryInterface.rawSelect("users", { where: { username: LEGACY_USERNAME } }, ["id"]);

    if (existingId) {
      await queryInterface.bulkUpdate(
        "users",
        { password: hashedPassword, role: "admin", updatedAt: now },
        { id: existingId }
      );
      if (legacyId && legacyId !== existingId) {
        await queryInterface.bulkDelete("users", { id: legacyId });
      }
      console.log(`[seed] Updated password for ${username}`);
      return;
    }

    if (legacyId) {
      await queryInterface.bulkUpdate(
        "users",
        { username, password: hashedPassword, role: "admin", updatedAt: now },
        { id: legacyId }
      );
      console.log(`[seed] Renamed ${LEGACY_USERNAME} -> ${username} and set the new password`);
      return;
    }

    await queryInterface.bulkInsert("users", [
      { id: uuidv4(), username, password: hashedPassword, role: "admin", createdAt: now, updatedAt: now },
    ]);
    console.log(`[seed] Created admin ${username}`);
  },

  // Passwords are one-way hashed; there is nothing meaningful to roll back to.
  down: async () => {},
};
