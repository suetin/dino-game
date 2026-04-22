'use strict'
/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('oauth_accounts', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
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
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provider_subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provider_login: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      provider_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })

    await queryInterface.addIndex('oauth_accounts', ['provider', 'provider_subject'], {
      unique: true,
      name: 'oauth_accounts_provider_subject_unique',
    })

    await queryInterface.addIndex('oauth_accounts', ['provider', 'user_id'], {
      unique: true,
      name: 'oauth_accounts_provider_user_unique',
    })

    await queryInterface.addIndex('oauth_accounts', ['user_id'], {
      name: 'oauth_accounts_user_id_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('oauth_accounts')
  },
}
