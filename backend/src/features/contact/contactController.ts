import type { Request, Response } from "express"
import { HttpError } from "../../utils/httpError"
import { getPaginationMeta, getPaginationParams } from "../../utils/pagination"
import { sendNoticeMail } from "../../utils/noticeMail"
import { hasPermission } from "../../permissions/permissions"
import { fetchModulesWithSubModules } from "../modules/services/moduleService"
import { contactListQuerySchema, contactStatusSchema, createContactSchema } from "./contactValidation"
import {
  ORG_ADMIN_ROLE_ID,
  SUPER_ADMIN_ROLE_ID,
  findContactUser,
  findSuperAdminEmails,
  insertContact,
  listContacts,
  resolveContact,
} from "./contactRepository"

const findAccessibleSubModule = async (req: Request, id: number) => {
  const permissions = req.user?.permissions ?? {}
  const expired = req.user?.expired ?? []
  const modules = await fetchModulesWithSubModules()
  return modules
    .flatMap((mod) => mod.subModules)
    .find((sm) => sm.id === id && (hasPermission(permissions[sm.code] ?? null, "READ") || expired.includes(sm.code)))
}

export const getContacts = async (req: Request, res: Response) => {
  const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit)
  const status = contactListQuerySchema.safeParse(req.query).data?.status
  const { role_id, id, organization_id } = req.user!
  const scope =
    role_id === SUPER_ADMIN_ROLE_ID
      ? null
      : role_id === ORG_ADMIN_ROLE_ID
        ? { column: "organization_id" as const, value: organization_id }
        : { column: "user_id" as const, value: id }
  const { rows, total } = await listContacts(scope, status, limit, offset)

  res.json({ success: true, data: rows, pagination: getPaginationMeta(page, limit, total) })
}

export const createContact = async (req: Request, res: Response) => {
  if (req.user!.role_id === SUPER_ADMIN_ROLE_ID) throw new HttpError(403, "Super admin cannot raise enquiries")
  const parsed = createContactSchema.safeParse(req.body)
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message)

  const { sub_module_id, other, subject, message } = parsed.data

  const subModule = sub_module_id ? await findAccessibleSubModule(req, sub_module_id) : null
  if (sub_module_id && !subModule) throw new HttpError(400, "Selected module is not accessible")

  const user = await findContactUser(req.user!.id)
  if (!user) throw new HttpError(404, "User not found")

  const id = await insertContact({
    user,
    sub_module_id: subModule?.id ?? null,
    other: other || null,
    subject,
    message,
  })

  const summary: [string, string][] = [
    ["Reference", `#${id}`],
    ["Module", subModule?.name ?? (other || "Not specified")],
    ["Subject", subject],
    ["Message", message],
  ]

  if (user.user_email) {
    sendNoticeMail({
      to: user.user_email,
      name: user.user_name,
      subject: `We received your request #${id}`,
      message: "We have received your technical difficulty request and our team will contact you soon. Here is a summary of your request:",
      details: summary,
    })
  }

  const sender: [string, string][] = [
    ["Name", user.user_name],
    ["User ID", String(user.id)],
    ["Email", user.user_email ?? "-"],
    ["Phone", user.user_phone ?? "-"],
    ["Organization", user.org_name ?? "-"],
    ["Temple", user.temp_name ?? "-"],
  ]

  const admins = await findSuperAdminEmails()
  admins.forEach((admin) =>
    sendNoticeMail({
      to: admin.user_email,
      name: admin.user_name,
      subject: `New technical difficulty #${id}: ${subject}`,
      message: "A new technical difficulty has been raised. Details are below:",
      details: [...sender, ...summary],
    }),
  )

  res.status(201).json({ success: true, message: "Your request has been received. We will contact you soon.", data: { id } })
}

export const updateContact = async (req: Request, res: Response) => {
  if (req.user!.role_id !== SUPER_ADMIN_ROLE_ID) throw new HttpError(403, "Only super admin can update enquiry status")

  const id = Number(req.params.id)
  const parsed = contactStatusSchema.safeParse(req.body)
  if (!Number.isSafeInteger(id) || id <= 0 || !parsed.success) throw new HttpError(400, "Invalid request")

  const resolved = await resolveContact(id)
  if (!resolved) throw new HttpError(400, "Enquiry not found or already resolved")

  res.json({ success: true, message: "Enquiry marked as resolved" })
}
