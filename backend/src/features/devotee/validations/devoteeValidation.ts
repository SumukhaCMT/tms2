import { z } from "zod";

export const devoteeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  status: z.enum(["active", "inactive"]).optional(),

  temple_id: z.coerce.number().int().positive().optional(),
});

export const updateDevoteeSchema = z
  .object({
    temple_id: z.number().int().positive().nullable().optional(),

    devotee_name: z.string().trim().min(2).max(150).optional(),

    devotee_email: z
      .string()
      .trim()
      .email()
      .max(150)
      .nullable()
      .optional(),

    devotee_phone: z
      .string()
      .trim()
      .min(3)
      .max(20)
      .nullable()
      .optional(),

    devotee_gender: z
      .string()
      .trim()
      .max(20)
      .nullable()
      .optional(),

    devotee_dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be YYYY-MM-DD")
      .nullable()
      .optional(),

    devotee_gotra: z.string().trim().max(100).nullable().optional(),

    devotee_rashi: z.string().trim().max(100).nullable().optional(),

    devotee_nakshatra: z.string().trim().max(100).nullable().optional(),

    devotee_remark: z.string().trim().max(500).nullable().optional(),

    devotee_address_line1: z
      .string()
      .trim()
      .max(255)
      .nullable()
      .optional(),

    devotee_address_line2: z
      .string()
      .trim()
      .max(255)
      .nullable()
      .optional(),

    devotee_city: z.string().trim().max(100).nullable().optional(),

    devotee_state: z.string().trim().max(100).nullable().optional(),

    devotee_country: z.string().trim().max(100).nullable().optional(),

    devotee_pincode: z.string().trim().max(15).nullable().optional(),

    devotee_status: z.enum(["active", "inactive"]).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });