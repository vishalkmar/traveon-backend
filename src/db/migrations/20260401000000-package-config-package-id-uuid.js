'use strict';

/** Align package_configs.package_id with packages.id (UUID). */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const t = await qi.sequelize.transaction();
    try {
      const [rows] = await qi.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'package_configs'
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
        { transaction: t }
      );
      for (const row of rows) {
        const name = row.CONSTRAINT_NAME;
        if (name) {
          await qi.sequelize.query(
            `ALTER TABLE package_configs DROP FOREIGN KEY \`${name}\``,
            { transaction: t }
          );
        }
      }

      await qi.changeColumn(
        'package_configs',
        'package_id',
        {
          type: Sequelize.CHAR(36),
          allowNull: false,
        },
        { transaction: t }
      );

      await qi.sequelize.query(
        `ALTER TABLE package_configs
         ADD CONSTRAINT package_configs_package_id_fk
         FOREIGN KEY (package_id) REFERENCES packages(id)
         ON DELETE CASCADE ON UPDATE CASCADE`,
        { transaction: t }
      );

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    const t = await qi.sequelize.transaction();
    try {
      const [rows] = await qi.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'package_configs'
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
        { transaction: t }
      );
      for (const row of rows) {
        const name = row.CONSTRAINT_NAME;
        if (name) {
          await qi.sequelize.query(
            `ALTER TABLE package_configs DROP FOREIGN KEY \`${name}\``,
            { transaction: t }
          );
        }
      }

      await qi.changeColumn(
        'package_configs',
        'package_id',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        { transaction: t }
      );

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },
};
