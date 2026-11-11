



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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Temple } from "@/features/temple/templeTypes";
import type {
  CreateTrusteePayload,
  Trustee,
} from "../trusteeTypes";
import { trusteeSchema } from "../trusteeValidation";
import { FormStep, FormWizard, type StepDefinition } from "@/components/ui/form-wizard"
import { StateSelect } from "@/components/ui/state-select"
import { CalendarRange, MapPin, UserRound } from "lucide-react"

interface TrusteeFormProps {
  temples: Temple[];
  templesLoading: boolean;
  loading: boolean;
  initialValues?: Trustee;
  onSubmit: (data: CreateTrusteePayload) => Promise<void>;
  onCancel: () => void;
}

const getToday = (): string => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const getNextDate = (value: string): string | undefined => {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
};

const FORM_STEPS: StepDefinition[] = [
  { id: 1, label: "Basic Details", subLabel: "Temple, name and contact", icon: UserRound },
  { id: 2, label: "Address", subLabel: "Where they live", icon: MapPin },
  { id: 3, label: "Tenure", subLabel: "Dates, order and status", icon: CalendarRange },
]

export default function TrusteeForm({
  temples,
  templesLoading,
  loading,
  initialValues,
  onSubmit,
  onCancel,
}: TrusteeFormProps) {
  const isEditMode = Boolean(initialValues);
  const today = getToday();

  const form = useForm({
    defaultValues: {
      temple_id: (initialValues?.temple_id ?? null) as number | null,
      trustee_name: initialValues?.trustee_name ?? "",
      trustee_email: initialValues?.trustee_email ?? "",
      trustee_phone: initialValues?.trustee_phone ?? "",
      trustee_position: initialValues?.trustee_position ?? "",
      trustee_display_order: initialValues?.trustee_display_order ?? 1,
      trustee_address_line1: initialValues?.trustee_address_line1 ?? "",
      trustee_address_line2: initialValues?.trustee_address_line2 ?? "",
      trustee_city: initialValues?.trustee_city ?? "",
      trustee_state: initialValues?.trustee_state ?? "",
      trustee_country: initialValues?.trustee_country ?? "India",
      trustee_pincode: initialValues?.trustee_pincode ?? "",
      trustee_status: initialValues?.trustee_status ?? ("active" as const),
      start_date: initialValues?.start_date ?? today,
      end_date: initialValues?.end_date ?? "",
    },

    onSubmit: async ({ value }) => {
      const result = trusteeSchema.safeParse(value);

      if (!result.success) {
        return;
      }

      const validated = result.data;

      await onSubmit({
        ...validated,
        trustee_name: validated.trustee_name.trim(),
        trustee_email: validated.trustee_email.trim() || null,
        trustee_phone: validated.trustee_phone.trim() || null,
        trustee_position: validated.trustee_position.trim() || null,
        trustee_address_line1:
          validated.trustee_address_line1.trim() || null,
        trustee_address_line2:
          validated.trustee_address_line2.trim() || null,
        trustee_city: validated.trustee_city.trim() || null,
        trustee_state: validated.trustee_state.trim() || null,
        trustee_country: validated.trustee_country.trim(),
        trustee_pincode: validated.trustee_pincode.trim() || null,
      });
    },
  });

  return (
    <FormWizard
      steps={FORM_STEPS}
      title={isEditMode ? "Edit Trustee" : "Create Trustee"}
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
          form="trustee-form"
          className="cursor-pointer"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Trustee"
              : "Create Trustee"}
        </Button>
      }
    >
      <form
        id="trustee-form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        noValidate
      >
        <FormStep step={1}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <form.Field
              name="temple_id"
              validators={{
                onSubmit: ({ value }) =>
                  value === null ||
                  (Number.isSafeInteger(value) && value > 0)
                    ? undefined
                    : "Select a valid temple.",
              }}
            >
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                const selectedTemple = temples.find(
                  (temple) => temple.id === field.state.value,
                );

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Temple
                    </FieldLabel>

                    <Select
                      value={
                        field.state.value === null
                          ? "none"
                          : String(field.state.value)
                      }
                      onValueChange={(value) => {
                        field.handleChange(
                          value === "none" ? null : Number(value),
                        );
                        field.handleBlur();
                      }}
                      disabled={loading || templesLoading}
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
                              : "Select a temple (optional)"
                          }
                        >
                          {field.state.value === null
                            ? "No specific temple"
                            : selectedTemple?.temp_name}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="none">
                          No specific temple
                        </SelectItem>

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
                      Optionally assign this trustee to a temple.
                    </FieldDescription>

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="trustee_name"
              validators={{
                onSubmit: ({ value }) => {
                  const result =
                    trusteeSchema.shape.trustee_name.safeParse(value);

                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Trustee Name *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="e.g. Shreedhar Pawar"
                      maxLength={150}
                      disabled={loading}
                      aria-invalid={invalid}
                    />

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="trustee_position">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Position
                  </FieldLabel>

                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="e.g. Treasurer"
                    maxLength={100}
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="trustee_email"
              validators={{
                onSubmit: ({ value }) => {
                  const result =
                    trusteeSchema.shape.trustee_email.safeParse(value);

                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Email
                    </FieldLabel>

                    <Input
                      id={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="trustee@example.com"
                      maxLength={150}
                      disabled={loading}
                      aria-invalid={invalid}
                      unique={{ entity: "trustees", field: "email", excludeId: initialValues?.id }}
                    />

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="trustee_phone"
              validators={{
                onChange: ({ value }) => {
                  if (value === "" || /^\d*$/.test(value)) {
                    return undefined;
                  }

                  return "Phone number must contain digits only.";
                },
                onSubmit: ({ value }) => {
                  const result =
                    trusteeSchema.shape.trustee_phone.safeParse(value);

                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Phone
                    </FieldLabel>

                    <Input
                      id={field.name}
                      type="tel"
                      inputMode="numeric"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="10-digit phone number"
                      maxLength={10}
                      disabled={loading}
                      aria-invalid={invalid}
                      unique={{ entity: "trustees", field: "phone", excludeId: initialValues?.id }}
                    />

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </FormStep>

        <FormStep step={2}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <form.Field name="trustee_address_line1">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Address Line 1
                  </FieldLabel>

                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    maxLength={255}
                    placeholder="House / street address"
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="trustee_address_line2">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Address Line 2
                  </FieldLabel>

                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    maxLength={255}
                    placeholder="Area / landmark"
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="trustee_city">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    City
                  </FieldLabel>

                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    maxLength={100}
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="trustee_state">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    State
                  </FieldLabel>

                  <StateSelect
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="trustee_country"
              validators={{
                onSubmit: ({ value }) => {
                  const result =
                    trusteeSchema.shape.trustee_country.safeParse(value);

                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Country *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      maxLength={100}
                      disabled={loading}
                      aria-invalid={invalid}
                    />

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="trustee_pincode"
              validators={{
                onChange: ({ value }) =>
                  value === "" || /^\d*$/.test(value)
                    ? undefined
                    : "PIN code must contain digits only.",
                onSubmit: ({ value }) => {
                  const result =
                    trusteeSchema.shape.trustee_pincode.safeParse(value);

                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      PIN Code
                    </FieldLabel>

                    <Input
                      id={field.name}
                      type="text"
                      inputMode="numeric"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      maxLength={6}
                      placeholder="Enter 6-digit PIN code"
                      disabled={loading}
                      aria-invalid={invalid}
                    />

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </FormStep>

        <FormStep step={3}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <form.Field
              name="trustee_display_order"
              validators={{
                onSubmit: ({ value }) => {
                  const result =
                    trusteeSchema.shape.trustee_display_order.safeParse(
                      value,
                    );

                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Display Order *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      type="number"
                      min={1}
                      max={65535}
                      step={1}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value),
                        )
                      }
                      disabled={loading}
                      aria-invalid={invalid}
                    />

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="trustee_status">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Status
                  </FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                    //   if (value === "active" || value === "inactive") {
                    //     field.handleChange(value);
                    //   }
                    // }}
                    field.handleChange(
                        value as "active" | "inactive" |"former",
                      );
                      field.handleBlur();
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full cursor-pointer  capitalize cursor-pointer"
                    >
                      <SelectValue  placeholder="Select status"/>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="active">
                        Active
                      </SelectItem>
                      <SelectItem value="inactive">
                        Inactive
                      </SelectItem>
                      <SelectItem value="former">
                        Former
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field
              name="start_date"
              validators={{
                onSubmit: ({ value }) => {
                  const result =
                    trusteeSchema.shape.start_date.safeParse(value);

                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Start Date *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      disabled={loading}
                      aria-invalid={invalid}
                    />

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="end_date"
              validators={{
                onSubmit: ({ value }) => {
                  const result =
                    trusteeSchema.shape.end_date.safeParse(value);

                  if (!result.success) {
                    return result.error.issues[0]?.message;
                  }

                  const startDate = form.getFieldValue("start_date");

                  if (value <= startDate) {
                    return "End date must be later than start date.";
                  }

                  return undefined;
                },
              }}
            >
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                const startDate = form.getFieldValue("start_date");

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      End Date *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      type="date"
                      value={field.state.value}
                      min={getNextDate(startDate)}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      disabled={loading}
                      aria-invalid={invalid}
                    />

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </FormStep>
      </form>
    </FormWizard>
  );
}
