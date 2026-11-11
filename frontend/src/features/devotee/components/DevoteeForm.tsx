
import { useForm } from "@tanstack/react-form";
import { Landmark, Heart, MapPin } from "lucide-react";

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

import { FormStep, FormWizard, type StepDefinition } from "@/components/ui/form-wizard";
import type { Temple } from "../../temple/templeTypes";
import type { Devotee } from "../devoteeTypes";
// import { devoteeSchema, type DevoteeFormData } from "../devoteeValidation";
import {
  devoteeSchema,
  type DevoteeFormData,
 
} from "../devoteeValidation";

interface DevoteeFormProps {
  initialData?: Partial<Devotee> | null;
  temples: Temple[];
  loading?: boolean;
  templesLoading?: boolean;
  onSubmit: (data: DevoteeFormData) => Promise<void> | void;
  onCancel?: () => void;
}

const FORM_STEPS: StepDefinition[] = [
  { id: 1, label: "Basic Details", subLabel: "Personal information", icon: Landmark },
  { id: 2, label: "Devotional Details", subLabel: "Spiritual information", icon: Heart },
  { id: 3, label: "Address", subLabel: "Address and status", icon: MapPin },
];

const emptyToNull = (value: string) => value.trim() || null;

export default function DevoteeForm({
  initialData,
  temples,
  loading = false,
  templesLoading = false,
  onSubmit,
  onCancel,
}: DevoteeFormProps) {
  const isEditMode = Boolean(initialData);

  const form = useForm({
    defaultValues: {
      temple_id: initialData?.temple_id ?? 0,
      devotee_name: initialData?.devotee_name ?? "",
      devotee_email: initialData?.devotee_email ?? "",
      devotee_phone: initialData?.devotee_phone ?? "",
      devotee_gender: initialData?.devotee_gender ?? "",
      devotee_dob: initialData?.devotee_dob?.slice(0, 10) ?? "",
      devotee_gotra: initialData?.devotee_gotra ?? "",
      devotee_rashi: initialData?.devotee_rashi ?? "",
      devotee_nakshatra: initialData?.devotee_nakshatra ?? "",
      devotee_remark: initialData?.devotee_remark ?? "",
      devotee_address_line1: initialData?.devotee_address_line1 ?? "",
      devotee_address_line2: initialData?.devotee_address_line2 ?? "",
      devotee_city: initialData?.devotee_city ?? "",
      devotee_state: initialData?.devotee_state ?? "",
      devotee_country: initialData?.devotee_country ?? "",
      devotee_pincode: initialData?.devotee_pincode ?? "",
      devotee_status: initialData?.devotee_status ?? "active",
    },

    validators: {
      onSubmit: devoteeSchema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        devotee_name: value.devotee_name.trim(),
        devotee_email: emptyToNull(value.devotee_email),
        devotee_phone: emptyToNull(value.devotee_phone),
        devotee_gender: emptyToNull(value.devotee_gender),
        devotee_dob: emptyToNull(value.devotee_dob),
        devotee_gotra: emptyToNull(value.devotee_gotra),
        devotee_rashi: emptyToNull(value.devotee_rashi),
        devotee_nakshatra: emptyToNull(value.devotee_nakshatra),
        devotee_remark: emptyToNull(value.devotee_remark),
        devotee_address_line1: emptyToNull(value.devotee_address_line1),
        devotee_address_line2: emptyToNull(value.devotee_address_line2),
        devotee_city: emptyToNull(value.devotee_city),
        devotee_state: emptyToNull(value.devotee_state),
        devotee_country: emptyToNull(value.devotee_country),
        devotee_pincode: emptyToNull(value.devotee_pincode),
      });
    },
  });

  return (
    <FormWizard
      steps={FORM_STEPS}
      title={isEditMode ? "Edit Devotee" : "Add Devotee"}
      cancelButton={
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => onCancel ? onCancel() : form.reset()}
        >
          Cancel
        </Button>
      }
      submitButton={
        <Button
          type="submit"
          form="devotee-form"
          disabled={loading || templesLoading || temples.length === 0}
        >
          {loading ? "Saving..." : isEditMode ? "Update Devotee" : "Save Devotee"}
        </Button>
      }
    >
      <form
        id="devotee-form"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        noValidate
      >
        <FormStep step={1}>
          <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <form.Field name="temple_id">
              {(field) => {
                const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const selected = temples.find(
                  (temple) => Number(temple.id) === field.state.value,
                );

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>Temple *</FieldLabel>
                    <Select
                      value={field.state.value > 0 ? String(field.state.value) : ""}
                      onValueChange={(value) => {
                        field.handleChange(Number(value));
                        field.handleBlur();
                      }}
                      disabled={loading || templesLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select temple">
                          {selected?.temp_name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {temples.map((temple) => (
                          <SelectItem key={temple.id} value={String(temple.id)}>
                            {temple.temp_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {invalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            {([
              ["devotee_name", "Devotee Name *", "Enter devotee name"],
              ["devotee_email", "Email", "Enter email address"],
              ["devotee_phone", "Phone", "Enter phone number"],
            ] as const).map(([name, label, placeholder]) => (
              <form.Field key={name} name={name}>
                {(field) => {
                  const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={invalid}>
                      <FieldLabel>{label}</FieldLabel>
                      <Input
                        value={field.state.value ?? ""}
                        placeholder={placeholder}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        disabled={loading}
                        aria-invalid={invalid}
                      />
                      {invalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            ))}

            <form.Field name="devotee_gender">
              {(field) => (
                <Field>
                  <FieldLabel>Gender</FieldLabel>
                  <Select
                    value={field.state.value || "none"}
                    // onValueChange={(value) =>
                    //   field.handleChange(value === "none" ? "" : value)
                    // }
                    onValueChange={(value) => {
  field.handleChange(value === "none" ? "" : (value ?? ""));
}}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="devotee_dob">
              {(field) => (
                <Field>
                  <FieldLabel>Date of Birth</FieldLabel>
                  <Input
                    type="date"
                    value={field.state.value ?? ""}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </FormStep>

        <FormStep step={2}>
          <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {([
              ["devotee_gotra", "Gotra"],
              ["devotee_rashi", "Rashi"],
              ["devotee_nakshatra", "Nakshatra"],
            ] as const).map(([name, label]) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <Field>
                    <FieldLabel>{label}</FieldLabel>
                    <Input
                      value={field.state.value ?? ""}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={loading}
                    />
                  </Field>
                )}
              </form.Field>
            ))}

            <form.Field name="devotee_remark">
              {(field) => (
                <Field className="md:col-span-2 lg:col-span-3">
                  <FieldLabel>Remark</FieldLabel>
                  <Textarea
                    value={field.state.value ?? ""}
                    placeholder="Enter additional details"
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={loading}
                  />
                  <FieldDescription>Maximum 500 characters.</FieldDescription>
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </FormStep>

        <FormStep step={3}>
          <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {([
              ["devotee_address_line1", "Address Line 1"],
              ["devotee_address_line2", "Address Line 2"],
              ["devotee_city", "City"],
              ["devotee_state", "State"],
              ["devotee_country", "Country"],
              ["devotee_pincode", "Pincode"],
            ] as const).map(([name, label]) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <Field>
                    <FieldLabel>{label}</FieldLabel>
                    <Input
                      value={field.state.value ?? ""}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={loading}
                    />
                  </Field>
                )}
              </form.Field>
            ))}

            <form.Field name="devotee_status">
              {(field) => (
                <Field>
                  <FieldLabel>Status *</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as "active" | "inactive")
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
