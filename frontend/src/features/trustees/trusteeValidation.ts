

import { z } from "zod";
import { PHONE_PATTERN, validationMessages } from "@/lib/validation"
 

const optionalEmail = z
  .string()
  .trim()
  .max(150, "Email cannot exceed 150 characters")
  .refine(
    (value) =>
      value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Enter a valid email address",
  );

const optionalPhone = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || PHONE_PATTERN.test(value),
    validationMessages.phone,
  );

const optionalPincode = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{6}$/.test(value),
    "PIN code must contain exactly 6 digits",
  );

const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  (() => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  })();

export const trusteeSchema = z
  .object({
    temple_id: z.number().int().positive().nullable(),

    trustee_name: z
      .string()
      .trim()
      .min(2, "Trustee name must be at least 2 characters")
      .max(150, "Trustee name cannot exceed 150 characters")
      .regex(
        /^[\p{L}\p{M}]+(?:[ '\u2019.-][\p{L}\p{M}]+)*$/u,
        "Name must contain letters only; numbers are not allowed",
      ),

    trustee_email: optionalEmail,
    trustee_phone: optionalPhone,

    trustee_position: z
      .string()
      .trim()
      .max(100, "Position cannot exceed 100 characters"),

    trustee_display_order: z
      .number()
      .int("Display order must be a whole number")
      .min(1, "Display order must be at least 1")
      .max(65535, "Display order cannot exceed 65535"),

    trustee_address_line1: z
      .string()
      .trim()
      .max(255, "Address Line 1 cannot exceed 255 characters"),

    trustee_address_line2: z
      .string()
      .trim()
      .max(255, "Address Line 2 cannot exceed 255 characters"),

    trustee_city: z
      .string()
      .trim()
      .max(100, "City cannot exceed 100 characters"),

    trustee_state: z
      .string()
      .trim()
      .max(100, "State cannot exceed 100 characters"),

    trustee_country: z
      .string()
      .trim()
      .min(1, "Country is required")
      .max(100, "Country cannot exceed 100 characters"),

    trustee_pincode: optionalPincode,

    trustee_status: z.enum(["active", "inactive","former"]),

    start_date: z
      .string()
      .refine(validDate, "Enter a valid start date"),

    end_date: z
      .string()
      .refine(validDate, "Enter a valid end date"),
  })
  .refine(
    (data) => data.end_date > data.start_date,
    {
      message: "End date must be later than start date",
      path: ["end_date"],
    },
  );

export type TrusteeFormData = z.infer<typeof trusteeSchema>;

export const createTrusteeSchema = trusteeSchema;

// export const updateTrusteeSchema = trusteeSchema.partial();