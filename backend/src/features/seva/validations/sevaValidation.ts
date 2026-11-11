
// import { z } from "zod";

// export const createSevaSchema = z.object({
//   temple_id: z.coerce.number().int().positive(),

//   seva_name: z.string().trim().min(1).max(150),
//  // Deity is optional
//   deity_id: z.number().int().positive().nullable().optional(),
 
//   deity_name: z.string().optional(),
//   deity_code: z.string().optional(),
//   seva_amount: z.coerce.number()
//     .int()
//     .min(0)
//     .max(4294967295),

//   seva_gst_percent: z.coerce.number()
//     .min(0)
//     .max(999.99)
//     .default(0),

//   seva_is_default: z.enum(["yes", "no"]).default("no"),

//   seva_display_order: z.coerce.number()
//     .int()
//     .min(1)
//     .max(65535)
//     .default(1),

//   seva_remark: z.string()
//     .trim()
//     .max(255)
//     .nullable()
//     .optional(),

//   seva_status: z.enum(["active", "inactive"])
//     .default("active"),
// }).strict();

// export const updateSevaSchema = z.object({
//   temple_id: z.coerce.number().int().positive().optional(),

//   seva_name: z.string().trim().min(1).max(150).optional(),

//   seva_amount: z.coerce.number()
//     .int()
//     .min(0)
//     .max(4294967295)
//     .optional(),

//   seva_gst_percent: z.coerce.number()
//     .min(0)
//     .max(999.99)
//     .optional(),

//   seva_is_default: z.enum(["yes", "no"]).optional(),

//   seva_display_order: z.coerce.number()
//     .int()
//     .min(1)
//     .max(65535)
//     .optional(),

//   seva_remark: z.string()
//     .trim()
//     .max(255)
//     .nullable()
//     .optional(),

//   seva_status: z.enum(["active", "inactive"]).optional(),
// }).strict().refine(
//   (data) => Object.keys(data).length > 0,
//   { message: "At least one field is required." },
// );

// export const sevaListQuerySchema = z.object({
//   page: z.coerce.number().int().min(1).default(1),
//   limit: z.coerce.number().int().min(1).max(100).default(10),
//   search: z.string().trim().max(150).default(""),
//   temple_id: z.coerce.number().int().positive().optional(),
// });



import { z } from "zod";

// Optional deity ID:
// - null / empty string = no deity
// - numeric string = converted to number
// - undefined = omitted during update
const deityIdSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    return Number(value);
  },
  z.number().int().positive().nullable(),
);

export const createSevaSchema = z.object({
  temple_id: z.coerce.number().int().positive(),

  seva_name: z.string().trim().min(1).max(150),

  deity_id: deityIdSchema.optional(),

  deity_name: z.string().optional(),
  deity_code: z.string().optional(),

  seva_amount: z.coerce.number()
    .int()
    .min(0)
    .max(4294967295),

  seva_gst_percent: z.coerce.number()
    .min(0)
    .max(999.99)
    .default(0),

  seva_is_default: z.enum(["yes", "no"]).default("no"),

  seva_display_order: z.coerce.number()
    .int()
    .min(1)
    .max(65535)
    .default(1),

  seva_remark: z.string()
    .trim()
    .max(255)
    .nullable()
    .optional(),

  seva_status: z.enum(["active", "inactive"])
    .default("active"),
}).strict();

export const updateSevaSchema = z.object({
  temple_id: z.coerce.number().int().positive().optional(),

  seva_name: z.string().trim().min(1).max(150).optional(),

  // FIX: Allow updating, clearing, or retaining deity.
  deity_id: deityIdSchema.optional(),

  seva_amount: z.coerce.number()
    .int()
    .min(0)
    .max(4294967295)
    .optional(),

  seva_gst_percent: z.coerce.number()
    .min(0)
    .max(999.99)
    .optional(),

  seva_is_default: z.enum(["yes", "no"]).optional(),

  seva_display_order: z.coerce.number()
    .int()
    .min(1)
    .max(65535)
    .optional(),

  seva_remark: z.string()
    .trim()
    .max(255)
    .nullable()
    .optional(),

  seva_status: z.enum(["active", "inactive"]).optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required." },
);

export const sevaListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(150).default(""),

  temple_id: z.coerce.number().int().positive().optional(),
});
