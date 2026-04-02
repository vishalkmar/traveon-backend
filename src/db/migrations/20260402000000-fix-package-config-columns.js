'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if the package_configs table exists
      const tables = await queryInterface.showAllTables();
      
      if (tables.includes('package_configs')) {
        // Get existing columns
        const columns = await queryInterface.describeTable('package_configs');
        
        // Add missing columns if they don't exist
        if (!columns.gtx_pkg_id) {
          await queryInterface.addColumn('package_configs', 'gtx_pkg_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            after: 'package_id'
          });
          console.log('Added gtx_pkg_id column');
        }
        
        if (!columns.package_name) {
          await queryInterface.addColumn('package_configs', 'package_name', {
            type: Sequelize.STRING(255),
            allowNull: true,
            after: 'gtx_pkg_id'
          });
          console.log('Added package_name column');
        }
        
        if (!columns.countries_id) {
          await queryInterface.addColumn('package_configs', 'countries_id', {
            type: Sequelize.STRING(255),
            allowNull: true,
            after: 'package_name'
          });
          console.log('Added countries_id column');
        }
        
        if (!columns.min_price) {
          await queryInterface.addColumn('package_configs', 'min_price', {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: true,
            after: 'countries_id'
          });
          console.log('Added min_price column');
        }
        
        if (!columns.max_price) {
          await queryInterface.addColumn('package_configs', 'max_price', {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: true,
            after: 'min_price'
          });
          console.log('Added max_price column');
        }
        
        if (!columns.is_enabled) {
          await queryInterface.addColumn('package_configs', 'is_enabled', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            after: 'max_price'
          });
          console.log('Added is_enabled column');
        }
        
        if (!columns.disabled_at) {
          await queryInterface.addColumn('package_configs', 'disabled_at', {
            type: Sequelize.DATE,
            allowNull: true,
            after: 'is_enabled'
          });
          console.log('Added disabled_at column');
        }
        
        if (!columns.enabled_at) {
          await queryInterface.addColumn('package_configs', 'enabled_at', {
            type: Sequelize.DATE,
            allowNull: true,
            after: 'disabled_at'
          });
          console.log('Added enabled_at column');
        }
        
        // Add indexes if they don't exist
        const indexes = await queryInterface.sequelize.query(
          `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'package_configs'`
        );
        
        const indexNames = indexes[0].map(idx => idx.INDEX_NAME);
        
        if (!indexNames.includes('idx_gtx_pkg_id')) {
          await queryInterface.addIndex('package_configs', ['gtx_pkg_id'], {
            name: 'idx_gtx_pkg_id'
          });
          console.log('Added idx_gtx_pkg_id index');
        }
        
        if (!indexNames.includes('idx_is_enabled')) {
          await queryInterface.addIndex('package_configs', ['is_enabled'], {
            name: 'idx_is_enabled'
          });
          console.log('Added idx_is_enabled index');
        }
        
        if (!indexNames.includes('idx_countries_id')) {
          await queryInterface.addIndex('package_configs', ['countries_id'], {
            name: 'idx_countries_id'
          });
          console.log('Added idx_countries_id index');
        }
      }
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // This migration only adds columns/indexes, so down would be complex
    // We'll keep the down as a no-op since we're fixing an existing table
  }
};
