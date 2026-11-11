
import { z } from "zod";

const deityNameSchema = z
  .string()
  .trim()
  .min(2, "Deity name must contain at least 2 characters")
  .max(150, "Deity name must not exceed 150 characters");

// const deityImageSchema = z
//   .string()
//   .trim()
//   .max(50, "Image name must not exceed 50 characters")
//   .nullable()
//   .optional();
const deityImageSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z
    .string()
    .trim()
    .max(50, "Image name must not exceed 50 characters")
    .nullable()
    .optional()
);

const deityCodeSchema = z
  .string()
  .trim()
  .min(1, "Deity code is required")
  .max(50, "Deity code must not exceed 50 characters");

const deityDescriptionSchema = z
  .string()
  .trim()
  .nullable()
  .optional();

const templeIdSchema = z
  .number({ message: "A valid temple ID is required" })
  .int()
  .positive("Temple ID must be greater than zero");

const displayOrderSchema = z
  .number({ message: "Display order must be a number" })
  .int()
  .min(0, "Display order cannot be negative")
  .max(65535, "Display order is too large");


export const createDeitySchema = z.object({
  temple_id: templeIdSchema,
  deity_name: deityNameSchema,
  deity_img_name: deityImageSchema,
  deity_description: deityDescriptionSchema,
  deity_is_default: z.enum(["yes", "no"]).optional().default("no"),
  deity_display_order: displayOrderSchema.optional().default(1),
  deity_status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateDeitySchema = z
  .object({
    temple_id: templeIdSchema.optional(),
    deity_name: deityNameSchema.optional(),
    deity_img_name: deityImageSchema,
    deity_code: deityCodeSchema.optional(),
    deity_description: deityDescriptionSchema,
    deity_is_default: z.enum(["yes", "no"]).optional(),
    deity_display_order: displayOrderSchema.optional(),
    deity_status: z.enum(["active", "inactive"]).optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field must be provided for update" }
  );