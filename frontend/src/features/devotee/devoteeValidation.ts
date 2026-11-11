


import { z } from "zod";

export const devoteeSchema = z.object({
  temple_id: z.number().int().positive("Please select a temple"),

  devotee_name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name cannot exceed 150 characters"),

  devotee_email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Enter a valid email address",
    )
    .max(150),

  devotee_phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || value.length >= 3,
      "Enter a valid phone number",
    )
    .max(20),

  devotee_gender: z.string().max(20),

  devotee_dob: z.string().refine(
    (value) =>
      value === "" ||
      (!Number.isNaN(Date.parse(value)) &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)),
    "Enter a valid date",
  ),

  devotee_gotra: z.string().max(100),
  devotee_rashi: z.string().max(100),
  devotee_nakshatra: z.string().max(100),
  devotee_remark: z.string().max(500),

  devotee_address_line1: z.string().max(255),
  devotee_address_line2: z.string().max(255),
  devotee_city: z.string().max(100),
  devotee_state: z.string().max(100),
  devotee_country: z.string().max(100),
  devotee_pincode: z.string().max(15),

  devotee_status: z.enum(["active", "inactive"]),
});

// Form values: empty optional fields are strings.
export type DevoteeFormValues = z.infer<typeof devoteeSchema>;

// API payload: empty optional fields become null.
export type DevoteeFormData = Omit<
  DevoteeFormValues,
  | "devotee_email"
  | "devotee_phone"
  | "devotee_gender"
  | "devotee_dob"
  | "devotee_gotra"
  | "devotee_rashi"
  | "devotee_nakshatra"
  | "devotee_remark"
  | "devotee_address_line1"
  | "devotee_address_line2"
  | "devotee_city"
  | "devotee_state"
  | "devotee_country"
  | "devotee_pincode"
> & {
  devotee_email: string | null;
  devotee_phone: string | null;
  devotee_gender: string | null;
  devotee_dob: string | null;
  devotee_gotra: string | null;
  devotee_rashi: string | null;
  devotee_nakshatra: string | null;
  devotee_remark: string | null;
  devotee_address_line1: string | null;
  devotee_address_line2: string | null;
  devotee_city: string | null;
  devotee_state: string | null;
  devotee_country: string | null;
  devotee_pincode: string | null;
};
