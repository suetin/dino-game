import { Table, Column, Model, DataType, HasMany, Index } from 'sequelize-typescript'
import { Comment } from './Comment'

@Table({ tableName: 'topics' })
export class Topic extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  title!: string

  @Column({ type: DataType.TEXT })
  description!: string | null

  @Index
  @Column({ type: DataType.INTEGER, allowNull: false })
  author_id!: number

  @HasMany(() => Comment, { foreignKey: 'topic_id' })
  comments!: Comment[]
}
