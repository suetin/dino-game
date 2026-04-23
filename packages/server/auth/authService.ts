import bcrypt from 'bcrypt'
import { Op, UniqueConstraintError } from 'sequelize'
import { User } from '../models/User'
import { runtimeConfig } from '../config/runtimeConfig'

export type SignUpInput = {
  email: string
  password: string
  firstName: string
  secondName: string
  login: string
  phone: string
}

const BCRYPT_SALT_ROUNDS = runtimeConfig.bcryptSaltRounds

export function normalizeValue(value: string): string {
  return value.trim()
}

export function normalizeLoginOrEmail(value: string): string {
  return value.trim().toLowerCase()
}

export async function findUserByLoginOrEmail(login: string): Promise<User | null> {
  const normalizedLogin = normalizeLoginOrEmail(login)

  if (!normalizedLogin) {
    return null
  }

  return User.findOne({
    where: {
      [Op.or]: [{ login: normalizedLogin }, { email: normalizedLogin }],
    },
  })
}

export async function hasUserConflict(login: string, email: string): Promise<boolean> {
  const normalizedLogin = normalizeLoginOrEmail(login)
  const normalizedEmail = normalizeLoginOrEmail(email)

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ login: normalizedLogin }, { email: normalizedEmail }],
    },
  })

  return Boolean(existingUser)
}

export async function verifyPasswordSignIn(login: string, password: string): Promise<User | null> {
  const user = await findUserByLoginOrEmail(login)

  if (!user || !user.password_hash) {
    return null
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash)
  return isPasswordValid ? user : null
}

export async function createUserWithPassword(input: SignUpInput): Promise<User> {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS)

  try {
    return await User.create({
      first_name: normalizeValue(input.firstName),
      second_name: normalizeValue(input.secondName),
      display_name: null,
      login: normalizeLoginOrEmail(input.login),
      email: normalizeLoginOrEmail(input.email),
      phone: normalizeValue(input.phone),
      avatar: null,
      avatarUrl: null,
      password_hash: passwordHash,
    })
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new Error('USER_CONFLICT')
    }

    throw error
  }
}
