
// import { useForm } from "@tanstack/react-form";

// import { Button } from "@/components/ui/button";
// import {
//   Field,
//   FieldDescription,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import type { Temple } from "../../temple/templeTypes";
// import type {
//   CreateSevaPayload,
//   Seva,
// } from "../sevaTypes";
// import { useAuth } from "@/features/auth/useAuth";
// import { FormStep, FormWizard, type StepDefinition } from "@/components/ui/form-wizard"
// import { IndianRupee, Landmark, Settings2 } from "lucide-react"

// interface SevaFormProps {
//   temples: Temple[];
//   templesLoading: boolean;
//   loading: boolean;
//   initialValues?: Seva;
//   onSubmit: (data: CreateSevaPayload) => Promise<void>;
//   onCancel: () => void;
// }

// const FORM_STEPS: StepDefinition[] = [
//   { id: 1, label: "Basic Details", subLabel: "Temple and seva name", icon: Landmark },
//   { id: 2, label: "Pricing", subLabel: "Amount and GST", icon: IndianRupee },
//   { id: 3, label: "Settings", subLabel: "Order and status", icon: Settings2 },
// ]

// export default function SevaForm({
//   temples,
//   templesLoading,
//   loading,
//   initialValues,
//   onSubmit,
//   onCancel,
// }: SevaFormProps) {
//   const isEditMode = Boolean(initialValues);
//   const { user } = useAuth();
//   const isOrgAdmin = !!user?.organization_id && !user?.temple_id;

//   const form = useForm({
//     defaultValues: {
//       temple_id: initialValues?.temple_id ?? (isOrgAdmin ? 0 : user?.temple_id ?? 0),
//       seva_name: initialValues?.seva_name ?? "",
//       seva_amount: Number(initialValues?.seva_amount ?? 0),
//       seva_gst_percent: Number(
//         initialValues?.seva_gst_percent ?? 0,
//       ),
//       seva_is_default: initialValues?.seva_is_default ?? "no",
//       seva_display_order: initialValues?.seva_display_order ?? 1,
//       seva_remark: initialValues?.seva_remark ?? "",
//       seva_status: initialValues?.seva_status ?? "active",
//     },
//     onSubmit: async ({ value }) => {
//       await onSubmit({
//         ...value,
//         seva_name: value.seva_name.trim(),
//         seva_remark: value.seva_remark.trim() || null,
//       });
//     },
//   });

//   return (
//     <FormWizard
//       steps={FORM_STEPS}
//       title={isEditMode ? "Edit Seva" : "Create Seva"}
//       cancelButton={
//         <Button
//           className="cursor-pointer"
//           type="button"
//           variant="outline"
//           onClick={onCancel}
//           disabled={loading}
//         >
//           Cancel
//         </Button>
//       }
//       submitButton={
//         <Button
//           className="cursor-pointer"
//           type="submit"
//           form="seva-form"
//           disabled={
//             loading ||
//             templesLoading ||
//             temples.length === 0
//           }
//         >
//           {loading
//             ? "Saving..."
//             : isEditMode
//               ? "Update Seva"
//               : "Create Seva"}
//         </Button>
//       }
//     >
//       <form
//         id="seva-form"
//         onSubmit={(event) => {
//           event.preventDefault();
//           event.stopPropagation();
//           void form.handleSubmit();
//         }}
//         noValidate
//       >
//         <FormStep step={1}>
//           <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {isOrgAdmin && (
//               <form.Field
//                 name="temple_id"
//                 validators={{
//                   onSubmit: ({ value }) =>
//                     value > 0
//                       ? undefined
//                       : "Please select a temple.",
//                 }}
//               >
//                 {(field) => {
//                   const invalid =
//                     field.state.meta.isTouched &&
//                     !field.state.meta.isValid;

//                   const selectedTemple = temples.find(
//                     (temple) =>
//                       temple.id === Number(field.state.value)
//                   );

//                   return (
//                     <Field data-invalid={invalid}>
//                       <FieldLabel htmlFor={field.name}>
//                         Temple *
//                       </FieldLabel>

//                       <Select
//                         value={
//                           field.state.value > 0
//                             ? String(field.state.value)
//                             : ""
//                         }
//                         onValueChange={(value) => {
//                           field.handleChange(Number(value));
//                           field.handleBlur();
//                         }}
//                         disabled={
//                           loading ||
//                           templesLoading ||
//                           temples.length === 0
//                         }
//                       >
//                         <SelectTrigger
//                           id={field.name}
//                           className="w-full capitalize cursor-pointer"
//                           aria-invalid={invalid}
//                         >
//                           <SelectValue
//                             placeholder={
//                               templesLoading
//                                 ? "Loading temples..."
//                                 : temples.length === 0
//                                   ? "No temples available"
//                                   : "Select a temple"
//                             }
//                           >
//                             {selectedTemple?.temp_name}
//                           </SelectValue>
//                         </SelectTrigger>

//                         <SelectContent>
//                           {temples.map((temple) => (
//                             <SelectItem
//                               key={temple.id}
//                               value={String(temple.id)}
//                             >
//                               {temple.temp_name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>

//                       <FieldDescription>
//                         Select the temple this seva belongs to.
//                       </FieldDescription>

//                       {/* {invalid && (
//             <FieldError
//             errors={field.state.meta.errors}
//             />
//             )} */}

//                       {invalid && field.state.meta.errors.length > 0 && (
//                         <FieldError>
//                           {field.state.meta.errors.join(", ")}
//                         </FieldError>
//                       )}

//                     </Field>
//                   );
//                 }}
//               </form.Field>

//             )}

//             <form.Field
//               name="seva_name"
//               validators={{
//                 onSubmit: ({ value }) =>
//                   value.trim().length < 2
//                     ? "Enter a Seva name with at least 2 characters."
//                     : undefined,
//               }}
//             >
//               {(field) => (
//                 <Field>
//                   <FieldLabel>Seva Name *</FieldLabel>
//                   <Input
//                     value={field.state.value}
//                     onBlur={field.handleBlur}
//                     onChange={(event) =>
//                       field.handleChange(event.target.value)
//                     }
//                     placeholder="e.g. Maha Pooja"
//                     disabled={loading}
//                   />
//                   {field.state.meta.isTouched &&
//                     field.state.meta.errors.length > 0 && (
//                       <FieldError>
//                         {field.state.meta.errors.join(", ")}
//                       </FieldError>
//                     )}
//                 </Field>
//               )}
//             </form.Field>

//             <form.Field name="seva_remark">
//               {(field) => (
//                 <Field className="md:col-span-2 lg:col-span-3">
//                   <FieldLabel>Description / Remark</FieldLabel>
//                   <Textarea
//                     value={field.state.value}
//                     onBlur={field.handleBlur}
//                     onChange={(event) =>
//                       field.handleChange(event.target.value)
//                     }
//                     placeholder="Enter Seva details"
//                     maxLength={5000}
//                     disabled={loading}
//                   />
//                 </Field>
//               )}
//             </form.Field>
//           </FieldGroup>
//         </FormStep>

//         <FormStep step={2}>
//           <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//             <form.Field name="seva_amount">
//               {(field) => (
//                 <Field>
//                   <FieldLabel>Amount (₹) *</FieldLabel>
//                   <Input
//                     type="number"
//                     min={0}
//                     step="0.01"
//                     value={field.state.value}
//                     onChange={(event) =>
//                       field.handleChange(Number(event.target.value))
//                     }
//                     disabled={loading}
//                   />
//                 </Field>
//               )}
//             </form.Field>

//             <form.Field name="seva_gst_percent">
//               {(field) => (
//                 <Field>
//                   <FieldLabel>GST (%)</FieldLabel>
//                   <Input
//                     type="number"
//                     min={0}
//                     max={100}
//                     step="0.01"
//                     value={field.state.value}
//                     onChange={(event) =>
//                       field.handleChange(Number(event.target.value))
//                     }
//                     disabled={loading}
//                   />
//                 </Field>
//               )}
//             </form.Field>
//           </FieldGroup>
//         </FormStep>

//         <FormStep step={3}>
//           <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//             <form.Field name="seva_is_default">
//               {(field) => (
//                 <Field>
//                   <FieldLabel>Default Seva</FieldLabel>
//                   <Select
//                     value={field.state.value}
//                     onValueChange={(value) =>
//                       field.handleChange(value as "yes" | "no")
//                     }
//                     disabled={loading}
//                   >
//                     <SelectTrigger className="w-full capitalize cursor-pointer">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="no">No</SelectItem>
//                       <SelectItem value="yes">Yes</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </Field>
//               )}
//             </form.Field>

//             <form.Field name="seva_display_order">
//               {(field) => (
//                 <Field>
//                   <FieldLabel>Display Order</FieldLabel>
//                   <Input
//                     type="number"
//                     min={0}
//                     max={65535}
//                     value={field.state.value}
//                     onChange={(event) =>
//                       field.handleChange(
//                         Number(event.target.value),
//                       )
//                     }
//                     disabled={loading}
//                   />
//                 </Field>
//               )}
//             </form.Field>

//             <form.Field name="seva_status">
//               {(field) => (
//                 <Field>
//                   <FieldLabel>Status</FieldLabel>
//                   <Select
//                     value={field.state.value}
//                     onValueChange={(value) =>
//                       field.handleChange(
//                         value as "active" | "inactive",
//                       )
//                     }
//                     disabled={loading}
//                   >
//                     <SelectTrigger className="w-full capitalize cursor-pointer">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="active">Active</SelectItem>
//                       <SelectItem value="inactive">Inactive</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </Field>
//               )}
//             </form.Field>
//           </FieldGroup>
//         </FormStep>
//       </form>
//     </FormWizard>
//   );
// }

import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Deity } from "../../deities/deityTypes";
import type { Temple } from "../../temple/templeTypes";

import type {
  CreateSevaPayload,
  Seva,
} from "../sevaTypes";

import { useAuth } from "@/features/auth/useAuth";

import {
  FormStep,
  FormWizard,
  type StepDefinition,
} from "@/components/ui/form-wizard";

import {
  IndianRupee,
  Landmark,
  Settings2,
} from "lucide-react";

interface SevaFormProps {
  temples: Temple[];
  templesLoading: boolean;
  loading: boolean;

  deities: Deity[];
  deitiesLoading: boolean;

  selectedTempleId: number;
  onTempleChange: (templeId: number) => void;

  initialValues?: Seva;

  onSubmit: (data: CreateSevaPayload) => Promise<void>;
  onCancel: () => void;
}

const FORM_STEPS: StepDefinition[] = [
  {
    id: 1,
    label: "Basic Details",
    subLabel: "Temple and seva name",
    icon: Landmark,
  },
  {
    id: 2,
    label: "Pricing",
    subLabel: "Amount and GST",
    icon: IndianRupee,
  },
  {
    id: 3,
    label: "Settings",
    subLabel: "Order and status",
    icon: Settings2,
  },
];

export default function SevaForm({
  temples,
  templesLoading,
  loading,
  deities,
  deitiesLoading,
  selectedTempleId,
  onTempleChange,
  initialValues,
  onSubmit,
  onCancel,
}: SevaFormProps) {
  const isEditMode = Boolean(initialValues);

  const { user } = useAuth();

  const isOrgAdmin =
    !!user?.organization_id && !user?.temple_id;

  const form = useForm({
    defaultValues: {
      temple_id:
        initialValues?.temple_id ??
        (isOrgAdmin ? 0 : Number(user?.temple_id ?? 0)),

      deity_id: initialValues?.deity_id ?? null,

      seva_name: initialValues?.seva_name ?? "",

      seva_amount: Number(
        initialValues?.seva_amount ?? 0,
      ),

      seva_gst_percent: Number(
        initialValues?.seva_gst_percent ?? 0,
      ),

      seva_is_default:
        initialValues?.seva_is_default ?? "no" as "yes" | "no",

      seva_display_order:
        initialValues?.seva_display_order ?? 1,

      seva_remark:
        initialValues?.seva_remark ?? "",

      seva_status:
        initialValues?.seva_status ?? "active" as "active" | "inactive",
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        deity_id: value.deity_id ?? null,
        temple_id: Number(value.temple_id),
        seva_name: value.seva_name.trim(),
        seva_amount: Number(value.seva_amount),
        seva_gst_percent: Number(value.seva_gst_percent),
        seva_remark: value.seva_remark.trim() || null,
      });
    },
  });

  return (
    <FormWizard
      steps={FORM_STEPS}
      title={isEditMode ? "Edit Seva" : "Create Seva"}
      cancelButton={
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      }
      submitButton={
        <Button
          type="submit"
          form="seva-form"
          className="cursor-pointer"
          disabled={
            loading ||
            templesLoading ||
            temples.length === 0
          }
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Seva"
              : "Create Seva"}
        </Button>
      }
    >
      <form
        id="seva-form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        noValidate
      >
        {/* STEP 1: BASIC DETAILS */}
        <FormStep step={1}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* TEMPLE */}
            {isOrgAdmin && (
              <form.Field
                name="temple_id"
                validators={{
                  onSubmit: ({ value }) =>
                    value > 0
                      ? undefined
                      : "Please select a temple.",
                }}
              >
                {(field) => {
                  const invalid =
                    field.state.meta.isTouched &&
                    !field.state.meta.isValid;

                  const selectedTemple = temples.find(
                    (temple) =>
                      Number(temple.id) ===
                      Number(field.state.value),
                  );

                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Temple *
                      </FieldLabel>

                      <Select
                        value={
                          field.state.value > 0
                            ? String(field.state.value)
                            : ""
                        }
                        onValueChange={(value) => {
                          const templeId = Number(value);

                          field.handleChange(templeId);
                          field.handleBlur();

                          // Clear previously selected deity.
                          form.setFieldValue(
                            "deity_id",
                            null,
                          );

                          // Update parent temple filter.
                          onTempleChange(templeId);
                        }}
                        disabled={
                          loading ||
                          templesLoading ||
                          temples.length === 0
                        }
                      >
                        <SelectTrigger
                          id={field.name}
                          className="w-full cursor-pointer"
                          aria-invalid={invalid}
                        >
                          <SelectValue
                            placeholder={
                              templesLoading
                                ? "Loading temples..."
                                : temples.length === 0
                                  ? "No temples available"
                                  : "Select a temple"
                            }
                          >
                            {selectedTemple?.temp_name}
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                          {temples.map((temple) => (
                            <SelectItem
                              key={temple.id}
                              value={String(temple.id)}
                            >
                              {temple.temp_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FieldDescription>
                        Select the temple this Seva belongs to.
                      </FieldDescription>

                      {invalid &&
                        field.state.meta.errors.length > 0 && (
                          <FieldError>
                            {field.state.meta.errors.join(", ")}
                          </FieldError>
                        )}
                    </Field>
                  );
                }}
              </form.Field>
            )}

            {/* DEITY - OPTIONAL */}
            <form.Field name="deity_id">
              {(field) => {
                const selectedDeity = deities.find(
                  (deity) =>
                    Number(deity.id) ===
                    Number(field.state.value),
                );

                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      Deity Name (Optional)
                    </FieldLabel>

                    <Select
                      value={
                        field.state.value
                          ? String(field.state.value)
                          : ""
                      }
                      onValueChange={(value) => {
                        const deityId = Number(value);

                        field.handleChange(
                          deityId > 0 ? deityId : null,
                        );

                        field.handleBlur();
                      }}
                      disabled={
                        loading ||
                        !selectedTempleId ||
                        deitiesLoading ||
                        deities.length === 0
                      }
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full cursor-pointer"
                      >
                        <SelectValue
                          placeholder={
                            !selectedTempleId
                              ? "Select a temple first"
                              : deitiesLoading
                                ? "Loading deities..."
                                : deities.length === 0
                                  ? "No deities available"
                                  : "Select a deity (optional)"
                          }
                        >
                          {selectedDeity?.deity_name}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {deities.map((deity) => (
                          <SelectItem
                            key={deity.id}
                            value={String(deity.id)}
                          >
                            {deity.deity_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldDescription>
                      You can select a deity or leave this field empty.
                    </FieldDescription>
                  </Field>
                );
              }}
            </form.Field>

            {/* SEVA NAME */}
            <form.Field
              name="seva_name"
              validators={{
                onSubmit: ({ value }) =>
                  value.trim().length < 2
                    ? "Enter a Seva name with at least 2 characters."
                    : value.trim().length > 150
                      ? "Seva name cannot exceed 150 characters."
                      : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>
                    Seva Name *
                  </FieldLabel>

                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="e.g. Maha Pooja"
                    maxLength={150}
                    disabled={loading}
                  />

                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                </Field>
              )}
            </form.Field>

            {/* REMARK */}
            <form.Field name="seva_remark">
              {(field) => (
                <Field className="md:col-span-2 lg:col-span-3">
                  <FieldLabel>
                    Description / Remark
                  </FieldLabel>

                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="Enter Seva details"
                    maxLength={255}
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </FormStep>

        {/* STEP 2: PRICING */}
        <FormStep step={2}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <form.Field
              name="seva_amount"
              validators={{
                onSubmit: ({ value }) =>
                  value < 0
                    ? "Amount cannot be negative."
                    : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>
                    Amount (₹) *
                  </FieldLabel>

                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        Number(event.target.value),
                      )
                    }
                    disabled={loading}
                  />

                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                </Field>
              )}
            </form.Field>

            <form.Field
              name="seva_gst_percent"
              validators={{
                onSubmit: ({ value }) =>
                  value < 0 || value > 100
                    ? "GST must be between 0 and 100."
                    : undefined,
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>
                    GST (%)
                  </FieldLabel>

                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        Number(event.target.value),
                      )
                    }
                    disabled={loading}
                  />

                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </FormStep>

        {/* STEP 3: SETTINGS */}
        <FormStep step={3}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <form.Field name="seva_is_default">
              {(field) => (
                <Field>
                  <FieldLabel>
                    Default Seva
                  </FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as "yes" | "no",
                      )
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full capitalize cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="no">
                        No
                      </SelectItem>

                      <SelectItem value="yes">
                        Yes
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="seva_display_order">
              {(field) => (
                <Field>
                  <FieldLabel>
                    Display Order
                  </FieldLabel>

                  <Input
                    type="number"
                    min={0}
                    max={65535}
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(
                        Number(event.target.value),
                      )
                    }
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="seva_status">
              {(field) => (
                <Field>
                  <FieldLabel>
                    Status
                  </FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as "active" | "inactive",
                      )
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full capitalize cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="active">
                        Active
                      </SelectItem>

                      <SelectItem value="inactive">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </FormStep>
      </form>
    </FormWizard>
  );
}