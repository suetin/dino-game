import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript'
import { Topic } from './Topic'
import { Reaction } from './Reaction'

@Table({ tableName: 'comments' })
export class Comment extends Model {
  @Column({ type: DataType.TEXT, allowNull: false })
  content!: string

  @ForeignKey(() => Topic)
  @Column({ type: DataType.INTEGER, allowNull: false })
  topic_id!: number

  @ForeignKey(() => Comment)
  @Column({ type: DataType.INTEGER })
  parentId!: number

  @Column({ type: DataType.INTEGER, allowNull: false })
  author_id!: number

  @BelongsTo(() => Topic)
  topic!: Topic

  @HasMany(() => Comment)
  replies!: Comment[]

  @HasMany(() => Reaction)
  reactions!: Reaction[]
}
