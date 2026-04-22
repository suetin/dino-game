import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript'
import { User } from './User'

@Table({ tableName: 'auth_sessions', timestamps: false })
export class AuthSession extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, allowNull: false })
  override id!: string

  @Index
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id!: number

  @Column({ type: DataType.DATE, allowNull: false })
  created_at!: Date

  @Index
  @Column({ type: DataType.DATE, allowNull: false })
  expires_at!: Date

  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user!: User
}
