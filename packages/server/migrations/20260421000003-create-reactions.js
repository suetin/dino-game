'use strict'
/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  async up(queryInterface, Sequelize) {
    const allTables = await queryInterface.showAllTables()
    const hasReactionsTable = allTables.some(table => {
      if (typeof table === 'string') {
        return table === 'reactions'
      }

      return table?.tableName === 'reactions'
    })

    if (!hasReactionsTable) {
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
    }

    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "reactions_comment_id_idx" ON "reactions" ("comment_id")'
    )
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS "reactions_user_id_idx" ON "reactions" ("user_id")'
    )
    await queryInterface.sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "reactions_comment_user_emoji_unique" ON "reactions" ("comment_id", "user_id", "emoji")'
    )
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reactions')
  },
}
