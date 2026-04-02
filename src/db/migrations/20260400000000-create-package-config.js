'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop table if it exists to clean up from any failed migrations
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS package_configs;');
    
    // Create fresh table with correct schema
    await queryInterface.sequelize.query(`
      CREATE TABLE package_configs (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        package_id CHAR(36) NOT NULL,
        gtx_pkg_id INT NOT NULL,
        package_name VARCHAR(255),
        countries_id VARCHAR(255),
        min_price DECIMAL(15, 2),
        max_price DECIMAL(15, 2),
        is_enabled BOOLEAN DEFAULT true,
        disabled_at DATETIME NULL,
        enabled_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_package_id (package_id),
        INDEX idx_gtx_pkg_id (gtx_pkg_id),
        INDEX idx_is_enabled (is_enabled),
        INDEX idx_countries_id (countries_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Add foreign key constraint after table is created
    await queryInterface.sequelize.query(`
      ALTER TABLE package_configs
      ADD CONSTRAINT fk_package_configs_package_id 
      FOREIGN KEY (package_id) 
      REFERENCES packages(id) 
      ON DELETE CASCADE 
      ON UPDATE CASCADE;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS package_configs;');
  }
};
