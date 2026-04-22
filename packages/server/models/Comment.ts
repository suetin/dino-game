import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Index,
} from 'sequelize-typescript'
import { Topic } from './Topic'
import { Reaction } from './Reaction'

@Table({ tableName: 'comments' })
export class Comment extends Model {
  @Column({ type: DataType.TEXT, allowNull: false })
  content!: string

  @Index
  @ForeignKey(() => Topic)
  @Column({ type: DataType.INTEGER, allowNull: false })
  topic_id!: number

  @Index
  @ForeignKey(() => Comment)
  @Column({ type: DataType.INTEGER })
  parentId!: number | null

  @Column({ type: DataType.INTEGER, allowNull: false })
  author_id!: number

  @BelongsTo(() => Topic, { foreignKey: 'topic_id' })
  topic!: Topic

  @HasMany(() => Comment, { foreignKey: 'parentId', as: 'replies' })
  replies!: Comment[]

  @HasMany(() => Reaction, { foreignKey: 'comment_id' })
  reactions!: Reaction[]
}
