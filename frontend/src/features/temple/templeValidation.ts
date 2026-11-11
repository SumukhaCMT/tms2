


import { z } from "zod";
import { PHONE_PATTERN, validationMessages } from "@/lib/validation"

const optionalTrimmedString = (maxLength: number, label: string) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} must not exceed ${maxLength} characters`);

export const templeSchema = z.object({
  // Required temple name
  temp_name: z
    .string()
    .trim()
    .min(1, "Temple name is required")
    .max(150, "Temple name must not exceed 150 characters"),

  temp_img_name: optionalTrimmedString(50, "Image filename"),

  temp_legal_name: optionalTrimmedString(200, "Legal name"),

  temp_registration_number: optionalTrimmedString(
    100,
    "Registration number",
  ),

  temp_gst_number: z
    .string()
    .trim()
    .max(20, "GST number must not exceed 20 characters")
    .refine(
      (value) =>
        value === "" ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
          value.toUpperCase(),
        ),
      "Enter a valid GSTIN",
    )
    .transform((value) => value.toUpperCase()),

  // Required email
  temp_email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .max(150, "Email must not exceed 150 characters")
    .pipe(z.email("Enter a valid email address")),

  temp_phone: z
    .string()
    .trim()
    .min(1, "Temple phone number is required")
    .regex(PHONE_PATTERN, validationMessages.phone),

  temp_address_line1: z
    .string()
    .trim()
    .max(255, "Address Line 1 must not exceed 255 characters"),

  temp_address_line2: z
    .string()
    .trim()
    .max(255, "Address Line 2 must not exceed 255 characters"),

  temp_city: z
    .string()
    .trim()
    .max(100, "City must not exceed 100 characters"),

  temp_state: z
    .string()
    .trim()
    .max(100, "State must not exceed 100 characters"),

  temp_country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country must not exceed 100 characters"),

  temp_pincode: z
    .string()
    .trim()
    .max(20, "Pincode must not exceed 20 characters")
    .refine(
      (value) => value === "" || /^\d{6}$/.test(value),
      "Pincode must be exactly 6 digits",
    ),

  temp_lat: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .nullable(),

  temp_lng: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .nullable(),

  temp_is_primary: z.boolean(),

  temp_status: z.enum(["active", "inactive", "suspended"]),

  temp_timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required")
    .max(50, "Timezone must not exceed 50 characters"),
});

export type TempleFormSchema = z.infer<typeof templeSchema>;
