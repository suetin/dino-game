'use strict'
/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('topics', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      author_id: {
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

    await queryInterface.addIndex('topics', ['author_id'], {
      name: 'topics_author_id_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('topics')
  },
}
