import crypto from "crypto"
import argon2 from "argon2"

import { HttpError } from "../../../utils/httpError"
import { withTransaction } from "../../../utils/transaction"
import { sendNoticeMail } from "../../../utils/noticeMail"
import pool from "../../../config/database"

import {
  countUsers,
  findAssignableRoles,
  findTemplesByOrganization,
  findUserActivityLogs,
  findUserDetails,
  findOwnProfile,
  findUserLogins,
  findUserTransfers,
  findUserInOrganization,
  findUserStatuses,
  findUsersByOrganization,
  getOrganizationLimit,
  insertTempleTransfer,
  insertUser,
  isEmailOrPhoneTaken,
  isTempleInOrganization,
  lockOrganizationLimit,
  revokeUserSessions,
  softDeleteUser,
  updateUser,
  updateUserStatus,
  updateUserTemple,
  upsertDesignation,
} from "../repositories/userRepository"

import type { CreateUserInput, TransferTempleInput, UpdateUserInput, UserActivity, UserLimit } from "../usersTypes"

const LIMIT_MESSAGE = "User limit reached. Delete an existing user or buy more users."

const PASSWORD_SETS = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "@#$%&*!?"]

const pick = (chars: string) => chars[crypto.randomInt(chars.length)]

export const generatePassword = (length = 12) => {
  const all = PASSWORD_SETS.join("")
  const chars = [...PASSWORD_SETS.map(pick), ...Array.from({ length: length - PASSWORD_SETS.length }, () => pick(all))]
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join("")
}

export const listUsersService = (organizationId: number, search = "") => findUsersByOrganization(organizationId, search)

export const listTemplesService = (organizationId: number) => findTemplesByOrganization(organizationId)

export const listStatusesService = () => findUserStatuses()

export const listRolesService = () => findAssignableRoles()

export const getUserLimitService = async (organizationId: number): Promise<UserLimit> => {
  const [limit, used] = await Promise.all([getOrganizationLimit(organizationId), countUsers(pool, organizationId)])
  return { limit, used, remaining: Math.max(0, limit - used) }
}

export const createUserService = async (organizationId: number, input: CreateUserInput) => {
  const [statuses, roles] = await Promise.all([findUserStatuses(), findAssignableRoles()])
  if (!statuses.includes(input.user_status)) throw new HttpError(400, "Invalid status")
  if (!roles.some((role) => role.id === input.role_id)) throw new HttpError(400, "Invalid role")

  const password = generatePassword()
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id })

  const id = await withTransaction(async (conn) => {
    const limit = await lockOrganizationLimit(conn, organizationId)
    if ((await countUsers(conn, organizationId)) >= limit) throw new HttpError(409, LIMIT_MESSAGE)
    if (!(await isTempleInOrganization(conn, input.temple_id, organizationId))) {
      throw new HttpError(403, "Selected temple does not belong to your organization")
    }
    if (await isEmailOrPhoneTaken(conn, input.user_email, input.user_phone)) {
      throw new HttpError(409, "A user with this email or phone already exists")
    }
    return insertUser(conn, {
      ...input,
      organization_id: organizationId,
      designation_id: await upsertDesignation(conn, organizationId, input.designation_name),
      user_code: `U${organizationId}-${Date.now().toString(36).toUpperCase()}`,
      user_password_hash: passwordHash,
    })
  })

  sendNoticeMail({
    to: input.user_email,
    name: input.user_name,
    subject: "Your TMS account has been created",
    message: `Your account has been created.\n\nEmail: ${input.user_email}\nPassword: ${password}\n\nPlease change your password after your first login.`,
    button: { label: "LOGIN", link: `${process.env.CLIENT_URL}/login` },
  })

  return { id, password }
}

export const updateUserStatusService = async (organizationId: number, id: number, status: string) => {
  const statuses = await findUserStatuses()
  if (!statuses.includes(status)) throw new HttpError(400, "Invalid status")

  await withTransaction(async (conn) => {
    const user = await findUserInOrganization(conn, id, organizationId)
    if (!user) throw new HttpError(404, "User not found")
    if (user.user_status === status) return
    await updateUserStatus(conn, id, status)
    if (status !== "active") await revokeUserSessions(conn, id)
  })
}

export const deleteUserService = async (organizationId: number, id: number) => {
  await withTransaction(async (conn) => {
    const user = await findUserInOrganization(conn, id, organizationId)
    if (!user) throw new HttpError(404, "User not found")
    await softDeleteUser(conn, id)
    await revokeUserSessions(conn, id)
  })
}

export const getUserService = async (organizationId: number, id: number) => {
  const user = await findUserDetails(organizationId, id)
  if (!user) throw new HttpError(404, "User not found")
  return user
}

export const updateUserService = async (organizationId: number, id: number, input: UpdateUserInput) => {
  const [statuses, roles] = await Promise.all([findUserStatuses(), findAssignableRoles()])
  if (!statuses.includes(input.user_status)) throw new HttpError(400, "Invalid status")
  if (!roles.some((role) => role.id === input.role_id)) throw new HttpError(400, "Invalid role")

  await withTransaction(async (conn) => {
    const user = await findUserInOrganization(conn, id, organizationId)
    if (!user) throw new HttpError(404, "User not found")
    if (await isEmailOrPhoneTaken(conn, input.user_email, input.user_phone, id)) {
      throw new HttpError(409, "A user with this email or phone already exists")
    }
    const { designation_name, ...details } = input
    await updateUser(conn, id, { ...details, designation_id: await upsertDesignation(conn, organizationId, designation_name) })
    if (input.user_status !== "active") await revokeUserSessions(conn, id)
  })
}

export const transferUserTempleService = async (organizationId: number, transferredBy: number, id: number, input: TransferTempleInput) => {
  await withTransaction(async (conn) => {
    const user = await findUserInOrganization(conn, id, organizationId)
    if (!user) throw new HttpError(404, "User not found")
    if (Number(user.temple_id) === input.to_temple_id) throw new HttpError(400, "User is already assigned to this temple")
    if (!(await isTempleInOrganization(conn, input.to_temple_id, organizationId))) {
      throw new HttpError(403, "Selected temple does not belong to your organization")
    }
    await insertTempleTransfer(conn, {
      ...input,
      user_id: id,
      organization_id: organizationId,
      from_temple_id: Number(user.temple_id),
      transferred_by: transferredBy,
    })
    await updateUserTemple(conn, id, input.to_temple_id)
  })
}

export const getMyProfileService = async (id: number, organizationId: number | null) => {
  const user = await findOwnProfile(id)
  if (!user) throw new HttpError(404, "User not found")
  const [logs, transfers, logins] = await Promise.all([
    findUserActivityLogs(id),
    organizationId ? findUserTransfers(id, organizationId) : [],
    findUserLogins(id),
  ])
  return { user, activity: { logs, transfers, logins } as UserActivity }
}

export const getUserActivityService = async (organizationId: number, id: number) => {
  await getUserService(organizationId, id)
  const [logs, transfers, logins] = await Promise.all([
    findUserActivityLogs(id),
    findUserTransfers(id, organizationId),
    findUserLogins(id),
  ])
  return { logs, transfers, logins } as UserActivity
}
