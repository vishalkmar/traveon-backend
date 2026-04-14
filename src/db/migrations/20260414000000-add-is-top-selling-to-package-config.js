'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('package_configs')) return;

      const columns = await queryInterface.describeTable('package_configs');

      if (!columns.is_top_selling) {
        await queryInterface.addColumn('package_configs', 'is_top_selling', {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
          after: 'is_enabled',
          comment: 'true = marked as top selling, shown first on packages page',
        });
        console.log('Added is_top_selling column to package_configs');
      }

      // Add index for fast lookup
      const indexes = await queryInterface.sequelize.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'package_configs'`
      );
      const indexNames = indexes[0].map((idx) => idx.INDEX_NAME);

      if (!indexNames.includes('idx_is_top_selling')) {
        await queryInterface.addIndex('package_configs', ['is_top_selling'], {
          name: 'idx_is_top_selling',
        });
        console.log('Added idx_is_top_selling index');
      }
    } catch (error) {
      console.error('Error in migration add-is-top-selling:', error);
      throw error;
    }
  },

  async down(queryInterface) {
    try {
      const columns = await queryInterface.describeTable('package_configs');
      if (columns.is_top_selling) {
        await queryInterface.removeColumn('package_configs', 'is_top_selling');
      }
    } catch (e) {
      console.error('Error reverting is_top_selling migration:', e);
    }
  },
};
