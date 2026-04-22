'use strict'
/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reactions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      emoji: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'comments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })

    await queryInterface.addIndex('reactions', ['comment_id'], {
      name: 'reactions_comment_id_idx',
    })

    await queryInterface.addIndex('reactions', ['user_id'], {
      name: 'reactions_user_id_idx',
    })

    await queryInterface.addIndex('reactions', ['comment_id', 'user_id', 'emoji'], {
      unique: true,
      name: 'reactions_comment_user_emoji_unique',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reactions')
  },
}
