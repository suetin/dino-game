'use strict'
/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auth_sessions', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })

    await queryInterface.addIndex('auth_sessions', ['user_id'], {
      name: 'auth_sessions_user_id_idx',
    })

    await queryInterface.addIndex('auth_sessions', ['expires_at'], {
      name: 'auth_sessions_expires_at_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('auth_sessions')
  },
}
