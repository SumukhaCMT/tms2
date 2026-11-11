

import { z } from "zod";

const optionalText = (max: number, label: string) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? null
        : value,
    z
      .string()
      .trim()
      .max(max, `${label} cannot exceed ${max} characters`)
      .nullable()
      .optional(),
  );

export const createTempleSchema = z.object({
  temp_name: z
    .string()
    .trim()
    .min(2, "Temple name must be at least 2 characters")
    .max(150, "Temple name cannot exceed 150 characters"),

  temp_img_name: optionalText(50, "Image filename"),
  temp_legal_name: optionalText(200, "Legal name"),
  temp_registration_number: optionalText(
    100,
    "Registration number",
  ),

  temp_gst_number: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? null
        : typeof value === "string"
          ? value.trim().toUpperCase()
          : value,
    z
      .string()
      .max(20, "GST number cannot exceed 20 characters")
      .refine(
        (value) =>
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
            value,
          ),
        "Enter a valid GST number",
      )
      .nullable()
      .optional(),
  ),

  temp_email: z
    .string()
    .trim()
    .min(1, "Temple email is required")
    .max(150, "Email cannot exceed 150 characters")
    .email("Enter a valid temple email address")
    .transform((value) => value.toLowerCase()),

  temp_phone: z
    .string()
    .trim()
    .min(1, "Temple phone number is required")
    .max(20, "Phone number cannot exceed 20 characters")
    .regex(
      /^\+?[0-9]{10,15}$/,
      "Enter a valid phone number with 10–15 digits",
    ),

  temp_address_line1: optionalText(255, "Address line 1"),
  temp_address_line2: optionalText(255, "Address line 2"),
  temp_city: optionalText(100, "City"),
  temp_state: optionalText(100, "State"),

  temp_country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country cannot exceed 100 characters")
    .default("India"),

  temp_pincode: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? null
        : value,
    z
      .string()
      .trim()
      .regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits")
      .nullable()
      .optional(),
  ),

  temp_lat: z.number().min(-90).max(90).nullable().optional(),
  temp_lng: z.number().min(-180).max(180).nullable().optional(),

  temp_slug: optionalText(150, "Temple slug"),

  temp_is_primary: z.boolean().default(false),

  temp_status: z
    .enum(["active", "inactive", "suspended"])
    .default("active"),

  temp_timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required")
    .max(50, "Timezone cannot exceed 50 characters")
    .default("Asia/Kolkata"),
});

export const updateTempleSchema =
  createTempleSchema.partial();
