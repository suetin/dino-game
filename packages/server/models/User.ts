import { Table, Column, Model, DataType, HasMany, Index } from 'sequelize-typescript'
import { AuthSession } from './AuthSession'
import { OAuthAccount } from './OAuthAccount'

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  override id!: number

  @Column({ type: DataType.STRING, allowNull: false })
  first_name!: string

  @Column({ type: DataType.STRING, allowNull: false })
  second_name!: string

  @Column({ type: DataType.STRING, allowNull: true })
  display_name!: string | null

  @Index({ unique: true })
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  login!: string

  @Index({ unique: true })
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string

  @Column({ type: DataType.STRING, allowNull: false })
  phone!: string

  @Column({ type: DataType.STRING, allowNull: true })
  avatar!: string | null

  @Column({ type: DataType.TEXT, allowNull: true, field: 'avatar_url' })
  avatarUrl!: string | null

  @Column({ type: DataType.STRING, allowNull: true })
  password_hash!: string | null

  @HasMany(() => AuthSession, { foreignKey: 'user_id' })
  sessions!: AuthSession[]

  @HasMany(() => OAuthAccount, { foreignKey: 'user_id' })
  oauthAccounts!: OAuthAccount[]
}
