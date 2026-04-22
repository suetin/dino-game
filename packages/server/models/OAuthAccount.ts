import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Index } from 'sequelize-typescript'
import { User } from './User'

@Table({ tableName: 'oauth_accounts', timestamps: false })
export class OAuthAccount extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  override id!: number

  @Index({ name: 'oauth_accounts_provider_subject_unique', unique: true })
  @Index({ name: 'oauth_accounts_provider_user_unique', unique: true })
  @Column({ type: DataType.STRING, allowNull: false })
  provider!: string

  @Index({ name: 'oauth_accounts_provider_subject_unique', unique: true })
  @Column({ type: DataType.STRING, allowNull: false, field: 'provider_subject' })
  providerSubject!: string

  @Index({ name: 'oauth_accounts_provider_user_unique', unique: true })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'user_id' })
  userId!: number

  @Column({ type: DataType.STRING, allowNull: true, field: 'provider_login' })
  providerLogin!: string | null

  @Column({ type: DataType.STRING, allowNull: true, field: 'provider_email' })
  providerEmail!: string | null

  @Column({ type: DataType.DATE, allowNull: false, field: 'created_at' })
  override createdAt!: Date

  @Column({ type: DataType.DATE, allowNull: false, field: 'updated_at' })
  override updatedAt!: Date

  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user!: User
}
