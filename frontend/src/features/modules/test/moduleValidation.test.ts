import { describe, expect, it } from "vitest"

import { moduleSchema } from "@/features/modules/moduleValidation"


const validModule = {
  module_code: "DONATION",
  module_name: "Donation Management",
  module_type: "feature" as const,
  capacity_type: null,
  consumable_type: null,
  display_order: 1,
  status: "active" as const,
}

describe("Module Validation", () => {
  describe("Valid data", () => {
    it("accepts a valid feature module", () => {
      const result = moduleSchema.safeParse(validModule)

      expect(result.success).toBe(true)
    })

    it("accepts a valid capacity module", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_type: "capacity",
        capacity_type: "users",
      })

      expect(result.success).toBe(true)
    })

    it("accepts a valid consumable module", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_type: "consumable",
        consumable_type: "sms",
      })

      expect(result.success).toBe(true)
    })
  })

  describe("Module code", () => {
    it("rejects module code shorter than 2 characters", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_code: "A",
      })

      expect(result.success).toBe(false)
    })

    it("rejects module code containing spaces", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_code: "DONATION MODULE",
      })

      expect(result.success).toBe(false)
    })

    it("rejects invalid special characters", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_code: "DONATION@",
      })

      expect(result.success).toBe(false)
    })

    it("accepts letters, numbers, underscore and hyphen", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_code: "DONATION_01",
      })

      expect(result.success).toBe(true)
    })
  })

  describe("Module name", () => {
    it("accepts letters", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_name: "Donation",
      })

      expect(result.success).toBe(true)
    })

    it("accepts letters with spaces", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_name: "Donation Management",
      })

      expect(result.success).toBe(true)
    })

    it("rejects numbers", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_name: "Donation123",
      })

      expect(result.success).toBe(false)
    })

    it("rejects underscore", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_name: "Donation_Management",
      })

      expect(result.success).toBe(false)
    })

    it("rejects hyphen", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_name: "Donation-Management",
      })

      expect(result.success).toBe(false)
    })

    it("rejects special characters", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_name: "Donation@Management",
      })

      expect(result.success).toBe(false)
    })

    it("rejects less than 3 characters", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_name: "AB",
      })

      expect(result.success).toBe(false)
    })

    it("rejects more than 100 characters", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_name: "A".repeat(101),
      })

      expect(result.success).toBe(false)
    })
  })

  describe("Capacity module", () => {
    it("requires capacity_type", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_type: "capacity",
        capacity_type: null,
      })

      expect(result.success).toBe(false)
    })

    it("accepts users capacity", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_type: "capacity",
        capacity_type: "users",
      })

      expect(result.success).toBe(true)
    })

    it("accepts temple capacity", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_type: "capacity",
        capacity_type: "temple",
      })

      expect(result.success).toBe(true)
    })
  })

  describe("Consumable module", () => {
    it("requires consumable_type", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_type: "consumable",
        consumable_type: null,
      })

      expect(result.success).toBe(false)
    })

    it("accepts SMS", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_type: "consumable",
        consumable_type: "sms",
      })

      expect(result.success).toBe(true)
    })

    it("accepts email", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_type: "consumable",
        consumable_type: "email",
      })

      expect(result.success).toBe(true)
    })

    it("accepts WhatsApp", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        module_type: "consumable",
        consumable_type: "whatsapp",
      })

      expect(result.success).toBe(true)
    })
  })

  describe("Display order", () => {
    it("accepts zero", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        display_order: 0,
      })

      expect(result.success).toBe(true)
    })

    it("rejects negative display order", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        display_order: -1,
      })

      expect(result.success).toBe(false)
    })

    it("rejects decimal display order", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        display_order: 1.5,
      })

      expect(result.success).toBe(false)
    })
  })

  describe("Status", () => {
    it("accepts active", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        status: "active",
      })

      expect(result.success).toBe(true)
    })

    it("accepts inactive", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        status: "inactive",
      })

      expect(result.success).toBe(true)
    })

    it("rejects invalid status", () => {
      const result = moduleSchema.safeParse({
        ...validModule,
        status: "deleted",
      })

      expect(result.success).toBe(false)
    })
  })
})