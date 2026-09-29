import {
  insertDonationWithDetails,
  donationNumberExists,
  getDonationsForScope,
  getDonationDetailById,
  updateDonationWithDetails,
  deleteDonationWithDetails,
  getTemplesForOrganization,
  templeBelongsToOrganization,
  getMeasurementUnits,
  createMeasurementUnit,
  getUserBasicInfo,
  searchReceiverCandidates,
  getReceiverCandidateDesignation,
  searchDonorsByName,
  getTempleName,
  setDonationReceiptPath,
} from "../repositories/donationRepository"

import type {
  CreateDonationPayload,
  CreateDonationResult,
  DonationListItem,
  DonationListScope,
  DonationDetail,
  UpdateDonationPayload,
  TempleOption,
  MeasurementUnit,
  TempleUserOption,
  DonorSuggestion,
} from "../donationsTypes"

// ============================
// Create Donation
// ============================

export const createDonation = async (
  payload: CreateDonationPayload,
): Promise<CreateDonationResult> => {
  return insertDonationWithDetails(payload)
}

// ============================
// Check Donation Number Exists
// ============================

export const checkDonationNumberExists = async (
  donationNumber: string,
): Promise<boolean> => {
  return donationNumberExists(donationNumber)
}

// ============================
// List Donations
// ============================

export const listDonations = async (
  scope: DonationListScope,
): Promise<DonationListItem[]> => {
  return getDonationsForScope(scope)
}


// ============================
// Get Donation Detail
// ============================

export const getDonationDetail = async (
  id: number,
): Promise<DonationDetail | null> => {
  return getDonationDetailById(id)
}

// ============================
// Update Donation
// ============================

export const updateDonation = async (
  id: number,
  payload: UpdateDonationPayload,
): Promise<void> => {
  return updateDonationWithDetails(id, payload)
}

// ============================
// Delete Donation
// ============================

export const deleteDonation = async (id: number): Promise<void> => {
  return deleteDonationWithDetails(id)
}


// ============================
// Temples (for the org_admin temple picker)
// ============================

export const listTemplesForOrganization = async (
  organizationId: number,
): Promise<TempleOption[]> => {
  return getTemplesForOrganization(organizationId)
}

export const isTempleInOrganization = async (
  templeId: number,
  organizationId: number,
): Promise<boolean> => {
  return templeBelongsToOrganization(templeId, organizationId)
}

// ============================
// Measurement Units
// ============================

export const listMeasurementUnits = async (): Promise<MeasurementUnit[]> => {
  return getMeasurementUnits()
}

export const addMeasurementUnit = async (
  unitName: string,
  createdBy: number | null,
): Promise<MeasurementUnit> => {
  return createMeasurementUnit(unitName, createdBy)
}


// ============================
// Receiver helpers (Receiver Details step)
// ============================

export const getUserBasicInfoService = async (
  userId: number,
): Promise<{ id: number; user_name: string; user_phone: string | null } | null> => {
  return getUserBasicInfo(userId)
}

export const searchReceiverCandidatesService = async (
  scope: { organizationId: number | null; templeId: number | null },
  query: string,
): Promise<TempleUserOption[]> => {
  return searchReceiverCandidates(scope, query)
}

export const getReceiverCandidateDesignationService = async (
  userId: number,
  scope: { organizationId: number | null; templeId: number | null },
): Promise<string | null> => {
  return getReceiverCandidateDesignation(userId, scope)
}

// ============================
// Donor search (Donor Details step)
// ============================

export const searchDonors = async (
  scope: DonationListScope,
  query: string,
): Promise<DonorSuggestion[]> => {
  return searchDonorsByName(scope, query)
}

// ============================
// Acknowledgement receipt (temple name + stored PDF filename)
// ============================

export const getTempleNameService = async (
  templeId: number,
): Promise<string | null> => {
  return getTempleName(templeId)
}

export const setDonationReceiptPathService = async (
  donationId: number,
  fileName: string | null,
): Promise<void> => {
  return setDonationReceiptPath(donationId, fileName)
}
