import type {
  Request,
  Response,
} from "express"
import fs from "fs"

import {
  createDonation,
  checkDonationNumberExists,
  listDonations,
  getDonationDetail,
  updateDonation,
  deleteDonation,
  listTemplesForOrganization,
  isTempleInOrganization,
  listMeasurementUnits,
  addMeasurementUnit,
  getUserBasicInfoService,
  searchReceiverCandidatesService,
  getReceiverCandidateDesignationService,
  searchDonors,
  getTempleNameService,
  setDonationReceiptPathService,
} from "../services/donationService"

import type {
  CreateDonationPayload,
  CreateDonationInkindData,
  CreateDonationMonetaryData,
  UpdateDonationPayload,
} from "../donationsTypes"

import { generateDonationReceiptPdf } from "../donationReceiptPdf"
import { ensureReceiptsDir, receiptFileName, receiptFilePath } from "../receiptStorage"
import { isOrgScope, isInScope, hideCreator } from "../../../utils/scope"

const PAN_AADHAAR_THRESHOLD = 50000
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const AADHAAR_REGEX = /^[0-9]{12}$/

const DONATION_METHODS = [
  "cash",
  "cheque",
  "upi",
  "dd",
  "net_banking",
]

const ITEM_TYPES = [
  "consumable",
  "fixed",
]


const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0

function validateDonationBody(body: Record<string, unknown>): string[] {
  const errors: string[] = []
  const donation = body.donation as Record<string, unknown> | undefined

  if (!donation || typeof donation !== "object") {
    return ["donation details are required"]
  }

  if (!isNonEmptyString(donation.donation_number)) {
    errors.push("donation_number is required")
  }
  if (!isNonEmptyString(donation.donor_name)) {
    errors.push("donor_name is required")
  }
  if (!isNonEmptyString(donation.donor_phone)) {
    errors.push("donor_phone is required")
  }
  if (!isNonEmptyString(donation.donor_state)) {
    errors.push("donor_state is required")
  }
  if (!isNonEmptyString(donation.donor_city)) {
    errors.push("donor_city is required")
  }
  if (!isNonEmptyString(donation.stored_at)) {
    errors.push("stored_at is required")
  }
  if (!isNonEmptyString(donation.donor_pincode)) {
    errors.push("donor_pincode is required")
  } else if (!/^[1-9][0-9]{5}$/.test(String(donation.donor_pincode).trim())) {
    errors.push("donor_pincode must be a valid 6-digit pincode")
  }

  const isMonetary = Boolean(donation.monetary)
  const isInkind = Boolean(donation.inkind)

  if (!isMonetary && !isInkind) {
    errors.push("at least one of monetary or inkind must be selected")
  }

  if (isMonetary) {
    const monetary = body.donation_monetary as
      | Record<string, unknown>
      | undefined

    if (!monetary) {
      errors.push("donation_monetary is required when monetary is selected")
    } else {
      if (!DONATION_METHODS.includes(String(monetary.donation_method))) {
        errors.push("donation_monetary.donation_method is invalid")
      }
      if (!isPositiveNumber(Number(monetary.donation_monetary_amount))) {
        errors.push("donation_monetary.donation_monetary_amount must be greater than 0")
      }
      if (!isNonEmptyString(monetary.donation_monetary_bank_name)) {
        errors.push("donation_monetary.donation_monetary_bank_name is required")
      }
      if (!isNonEmptyString(monetary.donation_monetary_reference_number)) {
        errors.push("donation_monetary.donation_monetary_reference_number is required")
      }
      if (!isNonEmptyString(monetary.donation_monetary_reference_date)) {
        errors.push("donation_monetary.donation_monetary_reference_date is required")
      }
      const amount = Number(monetary.donation_monetary_amount)
      if (amount > PAN_AADHAAR_THRESHOLD) {
        const pan = isNonEmptyString(monetary.donor_pan_number)
          ? monetary.donor_pan_number.trim().toUpperCase()
          : ""
        if (!PAN_REGEX.test(pan)) {
          errors.push(
            "donation_monetary.donor_pan_number is required and must be a valid PAN for donations above ₹50,000",
          )
        }

        const aadhaar = isNonEmptyString(monetary.donor_aadhaar_number)
          ? monetary.donor_aadhaar_number.trim()
          : ""
        if (!AADHAAR_REGEX.test(aadhaar)) {
          errors.push(
            "donation_monetary.donor_aadhaar_number is required and must be a valid 12-digit Aadhaar number for donations above ₹50,000",
          )
        }
      }
    }
  }

  if (isInkind) {
    const inkindItems = body.donation_inkind as
      | Record<string, unknown>[]
      | undefined

    if (!Array.isArray(inkindItems) || inkindItems.length === 0) {
      errors.push("donation_inkind is required when inkind is selected")
    } else {
      inkindItems.forEach((item, index) => {
        if (!ITEM_TYPES.includes(String(item.item_type))) {
          errors.push(`donation_inkind[${index}].item_type is invalid`)
        }
        if (!isNonEmptyString(item.item_title)) {
          errors.push(`donation_inkind[${index}].item_title is required`)
        }
        if (!isPositiveNumber(Number(item.measurement))) {
          errors.push(`donation_inkind[${index}].measurement must be greater than 0`)
        }
        if (!isNonEmptyString(item.measurement_unit)) {
          errors.push(`donation_inkind[${index}].measurement_unit is required`)
        }
        if (!isPositiveNumber(Number(item.quantity))) {
          errors.push(`donation_inkind[${index}].quantity must be greater than 0`)
        }
        const approx = Number(item.approximate_Market_value)
        const estimated = Number(item.estimated_value)
        if (!(approx > 0) && !(estimated > 0)) {
          errors.push(
            `donation_inkind[${index}].approximate_Market_value or estimated_value is required`,
          )
        }
      })
    }
  }

  return errors
}

export const postDonation = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const body = req.body as Record<string, unknown>
    const validationErrors = validateDonationBody(body)

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation details",
        errors: validationErrors,
      })
    }

    const donationInput = body.donation as Record<string, unknown>

    const donationNumber = String(donationInput.donation_number).trim()

    if (await checkDonationNumberExists(donationNumber)) {
      return res.status(409).json({
        success: false,
        message: "A donation with this donation number already exists",
      })
    }

    const isMonetary = Boolean(donationInput.monetary)
    const isInkind = Boolean(donationInput.inkind)

    // temple_id: org_admin isn't pinned to a single temple, so they must
    // pick one from the donor-details step and it's validated against
    // their own organization here. Every other role keeps recording
    // against their session's own temple_id, same as before - the
    // client can't override that.
    let templeId = req.user.temple_id

    if (isOrgScope(req.user)) {
      const requestedTempleId = Number(donationInput.temple_id)

      if (!Number.isInteger(requestedTempleId) || requestedTempleId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please select a temple",
        })
      }

      const belongsToOrg = await isTempleInOrganization(
        requestedTempleId,
        req.user.organization_id,
      )

      if (!belongsToOrg) {
        return res.status(403).json({
          success: false,
          message: "Selected temple does not belong to your organization",
        })
      }

      templeId = requestedTempleId
    }

    // Receiver Details step: every field is optional there. If the
    // person filling out the form left receiver name/phone AND didn't
    // pick a user via the receiver search, they themselves are the
    // receiver - default to their own session's name/phone. A
    // client-supplied receiver_user_id (from picking a search result) is
    // only trusted once re-validated server-side against the same rule
    // as the search itself (temple_admin of the caller's own temple, or
    // org_admin of the caller's own organization) - and when it checks
    // out, that user's actual role name becomes the authoritative
    // receiver_designation, overriding anything typed on the client.
    let receiverUserId: number | null = null
    let receiverName: string | null = isNonEmptyString(donationInput.receiver_name)
      ? donationInput.receiver_name.trim()
      : null
    let receiverPhone: string | null = isNonEmptyString(donationInput.receiver_phone)
      ? donationInput.receiver_phone.trim()
      : null
    let receiverDesignation: string | null = isNonEmptyString(donationInput.receiver_designation)
      ? donationInput.receiver_designation.trim()
      : null

    const requestedReceiverUserId = Number(donationInput.receiver_user_id)
    if (Number.isInteger(requestedReceiverUserId) && requestedReceiverUserId > 0) {
      const matchedDesignation = await getReceiverCandidateDesignationService(
        requestedReceiverUserId,
        { organizationId: req.user.organization_id, templeId: req.user.temple_id },
      )
      if (matchedDesignation) {
        receiverUserId = requestedReceiverUserId
        receiverDesignation = matchedDesignation
      }
    }

    if (!receiverUserId && !receiverName && !receiverPhone) {
      const self = await getUserBasicInfoService(req.user.id)
      if (self) {
        receiverUserId = self.id
        receiverName = self.user_name
        receiverPhone = self.user_phone
      }
    }

    const payload: CreateDonationPayload = {
      donation: {
        organization_id: req.user.organization_id,
        temple_id: templeId,
        user_id: req.user.id,
        created_by: req.user.id,
        donation_number: donationNumber,
        donor_name: String(donationInput.donor_name).trim(),
        donor_phone: String(donationInput.donor_phone).trim(),
        donor_email: donationInput.donor_email
          ? String(donationInput.donor_email).trim()
          : null,
        donor_pincode: String(donationInput.donor_pincode).trim(),
        donor_state: String(donationInput.donor_state).trim(),
        donor_city: String(donationInput.donor_city).trim(),
        donor_address_line1: donationInput.donor_address_line1
          ? String(donationInput.donor_address_line1).trim()
          : null,
        donor_address_line2: donationInput.donor_address_line2
          ? String(donationInput.donor_address_line2).trim()
          : null,
        monetary: isMonetary ? 1 : 0,
        inkind: isInkind ? 1 : 0,
        stored_at: String(donationInput.stored_at).trim(),
        receiver_user_id: receiverUserId,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        receiver_designation: receiverDesignation,
        overall_remarks: donationInput.overall_remarks
          ? String(donationInput.overall_remarks).trim()
          : null,
      },
    }

    if (isMonetary) {
      const monetary = body.donation_monetary as Record<string, unknown>

      const monetaryData: CreateDonationMonetaryData = {
        donation_method: monetary.donation_method as CreateDonationMonetaryData["donation_method"],
        donation_monetary_amount: Number(monetary.donation_monetary_amount),
        donation_monetary_bank_name: String(monetary.donation_monetary_bank_name).trim(),
        donation_monetary_reference_number: String(
          monetary.donation_monetary_reference_number,
        ).trim(),
        donation_monetary_reference_date: String(
          monetary.donation_monetary_reference_date,
        ).trim(),
        donation_monetary_remarks: monetary.donation_monetary_remarks
          ? String(monetary.donation_monetary_remarks).trim()
          : null,
        donor_pan_number: monetary.donor_pan_number
          ? String(monetary.donor_pan_number).trim().toUpperCase()
          : null,
        donor_aadhaar_number: monetary.donor_aadhaar_number
          ? String(monetary.donor_aadhaar_number).trim()
          : null,
      }

      payload.donation_monetary = monetaryData
    }

    if (isInkind) {
      const inkindItems = body.donation_inkind as Record<string, unknown>[]

      payload.donation_inkind = inkindItems.map((item): CreateDonationInkindData => ({
        item_type: item.item_type as CreateDonationInkindData["item_type"],
        item_title: String(item.item_title).trim(),
        measurement: Number(item.measurement),
        measurement_unit: String(item.measurement_unit).trim(),
        quantity: Number(item.quantity),
        approximate_Market_value: Number(item.approximate_Market_value),
        estimated_value: item.estimated_value
          ? Number(item.estimated_value)
          : 0,
        remarks: item.remarks ? String(item.remarks).trim() : null,
      }))
    }

    const result = await createDonation(payload)

    // Generate the acknowledgement receipt PDF right away so it's ready
    // the moment the frontend's post-submit screen asks for it. Never
    // let a PDF hiccup fail the donation itself - the download endpoint
    // (getDonationReceipt) regenerates on demand if this didn't run or
    // failed, so nothing is lost.
    try {
      const donationDetail = await getDonationDetail(result.id)
      if (donationDetail) {
        const templeName = (await getTempleNameService(donationDetail.temple_id)) ?? "Temple"
        const pdfBuffer = await generateDonationReceiptPdf({ donation: donationDetail, templeName })
        ensureReceiptsDir()
        fs.writeFileSync(receiptFilePath(result.id), pdfBuffer)
        await setDonationReceiptPathService(result.id, receiptFileName(result.id))
      }
    } catch (receiptError) {
      console.error("GENERATE DONATION RECEIPT ERROR:", receiptError)
    }

    return res.status(201).json({
      success: true,
      message: "Donation recorded successfully",
      data: result,
    })
  } catch (error) {
    const mysqlError = error as { code?: string }

    if (mysqlError.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A donation with this donation number already exists",
      })
    }

    console.error(
      "CREATE DONATION ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Get Donations (list)
// Scoped to the caller's organization/temple — see
// donationRepository.getDonationsForScope for the exact rule. Gated only
// by authenticate() (no requirePermission) since there isn't yet a
// "donations" sub_module row wired into the permissions table.
// ============================

export const getDonations = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const donations = await listDonations({
      organization_id: req.user.organization_id,
      temple_id: req.user.temple_id,
    })

    return res.status(200).json({
      success: true,
      data: hideCreator(donations, req.user.role_id),
    })
  } catch (error) {
    console.error(
      "GET DONATIONS ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}


// ============================
// Scope check
// Same tenant-isolation rule as the list endpoint: super_admin can
// touch any donation, org_admin only donations under their organization,
// temple_admin/user only donations recorded at their own temple.
// ============================

function isDonationInScope(
  donation: { organization_id: number; temple_id: number; created_by_role_id: number | null },
  user: { organization_id: number; temple_id: number },
): boolean {
  return isInScope(user, donation.organization_id, donation.temple_id, donation.created_by_role_id ?? undefined)
}

// ============================
// Get Donation (single)
// Used to prefill the edit wizard.
// ============================

export const getDonation = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID",
      })
    }

    const donation = await getDonationDetail(id)

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      })
    }

    if (!isDonationInScope(donation, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      })
    }

    return res.status(200).json({
      success: true,
      data: hideCreator([donation], req.user.role_id)[0],
    })
  } catch (error) {
    console.error(
      "GET DONATION ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Update Donation
// donation_number is immutable (read-only in the wizard) and
// organization_id/temple_id/user_id never change — only updated_by is
// set here, from the authenticated session.
// ============================

export const putDonation = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID",
      })
    }

    const existing = await getDonationDetail(id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      })
    }

    if (!isDonationInScope(existing, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      })
    }

    const body = req.body as Record<string, unknown>
    const validationErrors = validateDonationBody(body)

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation details",
        errors: validationErrors,
      })
    }

    const donationInput = body.donation as Record<string, unknown>
    const isMonetary = Boolean(donationInput.monetary)
    const isInkind = Boolean(donationInput.inkind)

    const payload: UpdateDonationPayload = {
      donation: {
        donor_name: String(donationInput.donor_name).trim(),
        donor_phone: String(donationInput.donor_phone).trim(),
        donor_email: donationInput.donor_email
          ? String(donationInput.donor_email).trim()
          : null,
        donor_pincode: String(donationInput.donor_pincode).trim(),
        donor_state: String(donationInput.donor_state).trim(),
        donor_city: String(donationInput.donor_city).trim(),
        donor_address_line1: donationInput.donor_address_line1
          ? String(donationInput.donor_address_line1).trim()
          : null,
        donor_address_line2: donationInput.donor_address_line2
          ? String(donationInput.donor_address_line2).trim()
          : null,
        monetary: isMonetary ? 1 : 0,
        inkind: isInkind ? 1 : 0,
        stored_at: String(donationInput.stored_at).trim(),
        overall_remarks: donationInput.overall_remarks
          ? String(donationInput.overall_remarks).trim()
          : null,
        updated_by: req.user.id,
      },
    }

    if (isMonetary) {
      const monetary = body.donation_monetary as Record<string, unknown>

      const monetaryData: CreateDonationMonetaryData = {
        donation_method: monetary.donation_method as CreateDonationMonetaryData["donation_method"],
        donation_monetary_amount: Number(monetary.donation_monetary_amount),
        donation_monetary_bank_name: String(monetary.donation_monetary_bank_name).trim(),
        donation_monetary_reference_number: String(
          monetary.donation_monetary_reference_number,
        ).trim(),
        donation_monetary_reference_date: String(
          monetary.donation_monetary_reference_date,
        ).trim(),
        donation_monetary_remarks: monetary.donation_monetary_remarks
          ? String(monetary.donation_monetary_remarks).trim()
          : null,
        donor_pan_number: monetary.donor_pan_number
          ? String(monetary.donor_pan_number).trim().toUpperCase()
          : null,
        donor_aadhaar_number: monetary.donor_aadhaar_number
          ? String(monetary.donor_aadhaar_number).trim()
          : null,
      }

      payload.donation_monetary = monetaryData
    }

    if (isInkind) {
      const inkindItems = body.donation_inkind as Record<string, unknown>[]

      payload.donation_inkind = inkindItems.map((item): CreateDonationInkindData => ({
        item_type: item.item_type as CreateDonationInkindData["item_type"],
        item_title: String(item.item_title).trim(),
        measurement: Number(item.measurement),
        measurement_unit: String(item.measurement_unit).trim(),
        quantity: Number(item.quantity),
        approximate_Market_value: Number(item.approximate_Market_value),
        estimated_value: item.estimated_value
          ? Number(item.estimated_value)
          : 0,
        remarks: item.remarks ? String(item.remarks).trim() : null,
      }))
    }

    await updateDonation(id, payload)

    // The donation's details just changed, so any previously generated
    // receipt PDF is now stale. Simplest correct fix: delete it and let
    // the next download (or the acknowledgement screen, if this was
    // reached from one) regenerate fresh content on demand.
    try {
      const stalePdfPath = receiptFilePath(id)
      if (fs.existsSync(stalePdfPath)) {
        fs.unlinkSync(stalePdfPath)
      }
      await setDonationReceiptPathService(id, null)
    } catch (receiptError) {
      console.error("INVALIDATE DONATION RECEIPT ERROR:", receiptError)
    }

    return res.status(200).json({
      success: true,
      message: "Donation updated successfully",
    })
  } catch (error) {
    console.error(
      "UPDATE DONATION ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Delete Donation
// ============================

export const removeDonation = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID",
      })
    }

    const existing = await getDonationDetail(id)

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      })
    }

    if (!isDonationInScope(existing, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      })
    }

    await deleteDonation(id)

    return res.status(200).json({
      success: true,
      message: "Donation deleted successfully",
    })
  } catch (error) {
    console.error(
      "DELETE DONATION ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}


// ============================
// Get Temples (for the org_admin temple picker on the donor-details step)
// Only org_admin needs this - other roles record against their own
// session temple_id and never see this dropdown.
// ============================

export const getDonationTemples = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    if (req.user.temple_id) {
      return res.status(200).json({
        success: true,
        data: [],
      })
    }

    const temples = await listTemplesForOrganization(req.user.organization_id)

    return res.status(200).json({
      success: true,
      data: temples,
    })
  } catch (error) {
    console.error(
      "GET DONATION TEMPLES ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Measurement Units
// ============================

export const getMeasurementUnitsList = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const units = await listMeasurementUnits()

    return res.status(200).json({
      success: true,
      data: units,
    })
  } catch (error) {
    console.error(
      "GET MEASUREMENT UNITS ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

export const postMeasurementUnit = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const body = req.body as Record<string, unknown>
    const unitName = isNonEmptyString(body.unit_name)
      ? body.unit_name.trim()
      : ""

    if (!unitName || !/^[A-Za-z\s]{1,50}$/.test(unitName)) {
      return res.status(400).json({
        success: false,
        message: "Unit name must contain letters only",
      })
    }

    const unit = await addMeasurementUnit(unitName, req.user.id)

    return res.status(201).json({
      success: true,
      data: unit,
    })
  } catch (error) {
    console.error(
      "CREATE MEASUREMENT UNIT ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}


// ============================
// Search Receiver Candidates (Receiver Details step - receiver-name
// search). Always scoped to the caller's own temple (for the
// temple_admin half of the search) and own organization (for the
// org_admin half) - never a temple_id from the client, and never any
// other role. See donationRepository.searchReceiverCandidates.
// ============================

export const getTempleUsers = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const query = typeof req.query.q === "string" ? req.query.q.trim() : ""

    const candidates = await searchReceiverCandidatesService(
      { organizationId: req.user.organization_id, templeId: req.user.temple_id },
      query,
    )

    return res.status(200).json({
      success: true,
      data: candidates,
    })
  } catch (error) {
    console.error(
      "SEARCH RECEIVER CANDIDATES ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Search Donors (Donor Details step - donor-name autocomplete)
// Scoped the same way the donations list is.
// ============================

export const getDonorSuggestions = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const query = typeof req.query.q === "string" ? req.query.q.trim() : ""

    if (query.length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
      })
    }

    const donors = await searchDonors(
      {
        organization_id: req.user.organization_id,
        temple_id: req.user.temple_id,
      },
      query,
    )

    return res.status(200).json({
      success: true,
      data: donors,
    })
  } catch (error) {
    console.error(
      "SEARCH DONORS ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// ============================
// Get Donation Receipt (acknowledgement PDF)
// Serves the stored PDF if one already exists on disk; otherwise
// generates it fresh from the donation's current data, saves it, and
// serves that - so this works both for the "Download/Print" buttons
// right after a create, and for the download action in the donations
// table for any older donation that never went through that flow.
// ============================

export const getDonationReceipt = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation ID",
      })
    }

    const donation = await getDonationDetail(id)

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      })
    }

    if (!isDonationInScope(donation, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      })
    }

    const filePath = receiptFilePath(id)
    const templeName = (await getTempleNameService(donation.temple_id)) ?? "Temple"
    const pdfBuffer = await generateDonationReceiptPdf({ donation, templeName })
    ensureReceiptsDir()
    fs.writeFileSync(filePath, pdfBuffer)
    if (!donation.receipt_pdf_path) await setDonationReceiptPathService(id, receiptFileName(id))

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Donation-Receipt-${donation.donation_number}.pdf"`,
    )

    return res.sendFile(filePath)
  } catch (error) {
    console.error(
      "GET DONATION RECEIPT ERROR:",
      error,
    )

    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
