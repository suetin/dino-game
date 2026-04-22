import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript'
import { Comment } from './Comment'

@Table({ tableName: 'reactions' })
export class Reaction extends Model {
  @Index({ name: 'reactions_comment_user_emoji_unique', unique: true })
  @Column({ type: DataType.STRING, allowNull: false })
  emoji!: string

  @Index
  @Index({ name: 'reactions_comment_user_emoji_unique', unique: true })
  @ForeignKey(() => Comment)
  @Column({ type: DataType.INTEGER, allowNull: false })
  comment_id!: number

  @Index
  @Index({ name: 'reactions_comment_user_emoji_unique', unique: true })
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id!: number

  @BelongsTo(() => Comment, { foreignKey: 'comment_id' })
  comment!: Comment
}
