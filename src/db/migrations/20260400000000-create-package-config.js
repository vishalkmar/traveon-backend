'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Use raw SQL to avoid Sequelize foreign key issues
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS package_configs (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        package_id CHAR(36) NOT NULL UNIQUE,
        gtx_pkg_id INT NOT NULL,
        package_name VARCHAR(255),
        countries_id VARCHAR(255),
        min_price DECIMAL(15, 2),
        max_price DECIMAL(15, 2),
        is_enabled BOOLEAN DEFAULT true,
        disabled_at DATETIME,
        enabled_at DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_gtx_pkg_id (gtx_pkg_id),
        KEY idx_is_enabled (is_enabled),
        KEY idx_countries_id (countries_id),
        CONSTRAINT fk_package_configs_package_id 
          FOREIGN KEY (package_id) 
          REFERENCES packages(id) 
          ON DELETE CASCADE 
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS package_configs;');
  }
};
