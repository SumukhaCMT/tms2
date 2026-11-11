import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import {Field,FieldDescription,FieldError,FieldGroup,FieldLabel,} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import type { Temple } from "../../temple/templeTypes";
import type { Deity } from "../deityTypes";
import { useState } from "react";
import { ImageUpload } from "@/components/image-upload";
import type { ImageSelection } from "@/utils/imageUpload";
import {
  deitySchema,
  type DeityFormData,
} from "../deityValidation";
import { FormStep, FormWizard, type StepDefinition } from "@/components/ui/form-wizard"
import { ImageIcon, Landmark, Settings2 } from "lucide-react"

interface DeityFormProps {
  initialData?: Partial<Deity> | null;
  loading?: boolean;
  temples: Temple[];
  templesLoading?: boolean;
  currentImageUrl?: string | null;
  onSubmit: (data: DeityFormData, image: ImageSelection) => Promise<void> | void;
  onCancel?: () => void;
}

const FORM_STEPS: StepDefinition[] = [
  { id: 1, label: "Basic Details", subLabel: "Temple and deity name", icon: Landmark },
  { id: 2, label: "Image", subLabel: "Deity photo", icon: ImageIcon },
  { id: 3, label: "Settings", subLabel: "Order and status", icon: Settings2 },
]

export default function DeitiesForm({
  initialData,
  loading = false,
  temples,
  templesLoading = false,
  currentImageUrl = null,
  onSubmit,
  onCancel,
}: DeityFormProps) {
  const isEditMode = Boolean(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imageScanning, setImageScanning] = useState(false);

  const form = useForm({
    defaultValues: {
      temple_id: initialData?.temple_id ?? 0,
      deity_name: initialData?.deity_name ?? "",
      // deity_code: initialData?.deity_code ?? "",
      deity_img_name: initialData?.deity_img_name ?? "",
      deity_description: initialData?.deity_description ?? "",
      deity_is_default: initialData?.deity_is_default ?? "no",
      deity_display_order: initialData?.deity_display_order ?? 1,
      deity_status: initialData?.deity_status ?? "active",
    } satisfies DeityFormData,

    validators: {
      onSubmit: deitySchema,
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        ...value,
        deity_name: value.deity_name.trim(),
        // deity_code: value.deity_code.trim(),
        deity_img_name: value.deity_img_name.trim(),
        deity_description: value.deity_description.trim(),
      }, { file: imageFile, removed: imageRemoved });
    },
  });
  return (
    <FormWizard
      steps={FORM_STEPS}
      title={isEditMode ? "Edit Deity" : "Create Deity"}
      cancelButton={
        <Button
        className="cursor-pointer"
          type="button"
          variant="outline"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              form.reset();
            }
          }}
          disabled={loading}
        >
          Cancel
        </Button>
      }
      submitButton={
        <Button
        className="cursor-pointer"
          type="submit"
          form="deity-form"
          disabled={loading || imageScanning || templesLoading || temples.length === 0}
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Deity"
              : "Create Deity"}
        </Button>
      }
    >
      <form
        id="deity-form"
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
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                const selectedTemple = temples.find(
                  (temple) => temple.id === Number(field.state.value)
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
                        field.handleChange(Number(value));
                        field.handleBlur();
                      }}
                      disabled={
                        loading ||
                        templesLoading ||
                        temples.length === 0
                      }
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full capitalize cursor-pointer"

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
                      Select the temple this deity belongs to.
                    </FieldDescription>

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="deity_name"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Deity Name *
                    </FieldLabel>

                    <Input
                      id={field.name}
                      value={field.state.value}
                      placeholder="e.g. Lord Ganesha"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="deity_description"
              children={(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field
                    className="md:col-span-2 lg:col-span-3"
                    data-invalid={invalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Description
                    </FieldLabel>

                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      placeholder="Enter deity details or description"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    <FieldDescription>
                      Optional; maximum 5000 characters.
                    </FieldDescription>

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </FormStep>

        <FormStep step={2}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ImageUpload
              label="Deity Image"
              value={imageFile}
              onChange={setImageFile}
              currentUrl={imageRemoved ? null : currentImageUrl}
              onRemoveCurrent={() => setImageRemoved(true)}
              onScanningChange={setImageScanning}
              disabled={loading}
              className="lg:col-span-1"
            />
          </FieldGroup>
        </FormStep>

        <FormStep step={3}>
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <form.Field
              name="deity_is_default"
              children={(field) => (
                <Field>
                  <FieldLabel>Default Deity *</FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value as "yes" | "no");
                      field.handleBlur();
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full capitalize cursor-pointer">
                      <SelectValue placeholder="Select default" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Choose whether this is the temple's default deity.
                  </FieldDescription>
                </Field>
              )}
            />

            <form.Field
              name="deity_display_order"
              children={(field) => {
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
                      min={0}
                      max={65535}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value),
                        )
                      }
                      aria-invalid={invalid}
                      disabled={loading}
                    />

                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="deity_status"
              children={(field) => (
                <Field>
                  <FieldLabel>Status *</FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(
                        value as "active" | "inactive",
                      );
                      field.handleBlur();
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full capitalize cursor-pointer">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
        </FormStep>
      </form>
    </FormWizard>
  );
}