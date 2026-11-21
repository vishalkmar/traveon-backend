"use strict";
/**
 * Superseded by 20261121000000-secure-admin-credentials.js.
 *
 * This used to insert a hard-coded "Traveon" / "Admin@123" admin. It is now a
 * no-op so `db:seed:all` can never bring that weak account back; the admin is
 * created from ADMIN_USERNAME / ADMIN_PASSWORD in .env by the newer seeder.
 */
module.exports = {
  up: async () => {},
  down: async () => {},
};
