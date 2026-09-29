import { Router } from "express"

import {
  postDonation,
  getDonations,
  getDonation,
  putDonation,
  removeDonation,
  getDonationTemples,
  getMeasurementUnitsList,
  postMeasurementUnit,
  getTempleUsers,
  getDonorSuggestions,
  getDonationReceipt,
} from "../controllers/donationsController"

import { authenticate, requirePermission } from "../../../middleware/auth.middleware"

const router = Router()

// Temples the caller may record a donation against (org_admin picks one
// on the donor-details step; other roles get an empty list back since
// they use their own session temple_id instead).
router.get(
  "/donations/temples",
  authenticate,
  getDonationTemples,
)

// Receiver-name search on the Receiver Details step - temple_admins of
// the caller's own temple and org_admins of the caller's own
// organization only (see donationRepository.searchReceiverCandidates).
router.get(
  "/donations/temple-users",
  authenticate,
  getTempleUsers,
)

// Donor-name search on the Donor Details step, so a repeat donor's
// details don't have to be retyped.
router.get(
  "/donations/donors/search",
  authenticate,
  getDonorSuggestions,
)

// Measurement unit dropdown for the in-kind step.
router.get(
  "/donations/measurement-units",
  authenticate,
  getMeasurementUnitsList,
)
router.post(
  "/donations/measurement-units",
  authenticate,
  postMeasurementUnit,
)

// List donations (scoped to the caller's organization/temple).
router.get(
  "/donations",
  authenticate,
  getDonations,
)

// Get a single donation (used to prefill the edit wizard).
router.get(
  "/donations/:id",
  authenticate,
  getDonation,
)

// Acknowledgement receipt PDF - generates it on first request if one
// doesn't already exist on disk, then serves it. Backs both the
// post-submit "Download/Print" buttons and the download action in the
// donations table.
router.get(
  "/donations/:id/receipt",
  authenticate,
  getDonationReceipt,
)

// Create donation (Donor Details + Donation Details wizard submit).
// organization_id / temple_id / user_id are taken from the authenticated
// session, so this always needs a valid token.
router.post(
  "/donations",
  authenticate,
  requirePermission("donations", "ADD"),
  postDonation,
)

// Update donation.
router.put(
  "/donations/:id",
  authenticate,
  requirePermission("donations", "EDIT"),
  putDonation,
)

// Delete donation.
router.delete(
  "/donations/:id",
  authenticate,
  requirePermission("donations", "DELETE"),
  removeDonation,
)

export default router
