import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import { Comment } from './Comment'

@Table({ tableName: 'reactions' })
export class Reaction extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  emoji!: string

  @ForeignKey(() => Comment)
  @Column({ type: DataType.INTEGER, allowNull: false })
  comment_id!: number

  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id!: number

  @BelongsTo(() => Comment)
  comment!: Comment
}
