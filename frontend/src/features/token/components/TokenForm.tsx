


import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import type { Temple } from "../../temple/templeTypes";
import type { Seva } from "../../seva/sevaTypes";
import type { Deity } from "../../deities/deityTypes";

import type {
  CreateTokenPayload,
  Token,
  TokenStatus,
} from "../tokenTypes";

import { tokenSchema } from "../tokenValidation";

interface TokenFormProps {
  temples: Temple[];
  templesLoading: boolean;

  sevas: Seva[];
  deities: Deity[];

  sevasLoading: boolean;
  deitiesLoading: boolean;

  selectedTempleId: number;
  onTempleChange: (templeId: number) => void;

  loading: boolean;
  initialValues?: Token;

  onSubmit: (data: CreateTokenPayload) => Promise<void>;
  onCancel: () => void;
}

export default function TokenForm({
  temples,
  templesLoading,
  sevas,
  deities,
  sevasLoading,
  deitiesLoading,
  selectedTempleId,
  onTempleChange,
  loading,
  initialValues,
  onSubmit,
  onCancel,
}: TokenFormProps) {
  const isEditMode = Boolean(initialValues);

  const form = useForm({
    // defaultValues: {
    //   temple_id: initialValues?.temple_id ?? 0,
    //   token_name: initialValues?.token_name ?? "",
    //   token_description: initialValues?.token_description ?? "",
    //   seva_id: initialValues?.seva_id ?? (null as number | null),
    //   deity_id: initialValues?.deity_id ?? (null as number | null),
    //   token_display_order: initialValues?.token_display_order ?? 0,
    //    max_limit: initialValues?.max_limit ?? null,
    //   token_status: (initialValues?.token_status ??
        
    //     "active") as TokenStatus,
    // },
    defaultValues: {
  temple_id: initialValues?.temple_id ?? 0,
  token_name: initialValues?.token_name ?? "",
  token_description: initialValues?.token_description ?? "",
  seva_id: initialValues?.seva_id ?? null,
  deity_id: initialValues?.deity_id ?? null,
  token_display_order: initialValues?.token_display_order ?? 0,
  max_limit: initialValues?.max_limit ?? null,
  token_status: initialValues?.token_status ?? "active",
},

    onSubmit: async ({ value }) => {
      const parsed = tokenSchema.safeParse({
        ...value,
        token_name: value.token_name.trim(),
        token_description: value.token_description.trim(),
      });

      if (!parsed.success) {
        return;
      }

      // await onSubmit({
      //   ...parsed.data,
      //   token_name: parsed.data.token_name.trim(),
      //   token_description:
      //     parsed.data.token_description.trim() || null,
      // });
      await onSubmit({
  ...parsed.data,
  max_limit: parsed.data.max_limit ?? null,
  token_name: parsed.data.token_name.trim(),
  token_description:
    parsed.data.token_description.trim() || null,
});
    },
  });

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    form.setFieldValue("temple_id", initialValues.temple_id);
    form.setFieldValue("token_name", initialValues.token_name);
    form.setFieldValue(
      "max_limit",
      initialValues.max_limit ?? null,
    );

    form.setFieldValue(
      "token_description",
      initialValues.token_description ?? "",
    );

    form.setFieldValue("seva_id", initialValues.seva_id ?? null);
    form.setFieldValue("deity_id", initialValues.deity_id ?? null);

    form.setFieldValue(
      "token_display_order",
      initialValues.token_display_order,
    );

    form.setFieldValue(
      "token_status",
      initialValues.token_status,
    );

    onTempleChange(initialValues.temple_id);
  }, [initialValues, form, onTempleChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Edit Token" : "Create Token"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          id="token-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          noValidate
        >
          <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Temple dropdown */}
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
                const selectedTemple = temples.find(
                  (temple) => temple.id === field.state.value,
                );

                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

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

                        onTempleChange(templeId);

                        // Clear associations from the previous temple.
                        form.setFieldValue("seva_id", null);
                        form.setFieldValue("deity_id", null);
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
                      Select a temple to load its Sevas and Deities.
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

            {/* Token name */}
            <form.Field
              name="token_name"
              validators={{
                onSubmit: ({ value }) => {
                  const name = value.trim();

                  if (name.length < 2) {
                    return "Token name must contain at least 2 characters.";
                  }

                  if (name.length > 100) {
                    return "Token name cannot exceed 100 characters.";
                  }

                  return undefined;
                },
              }}
            >
              {(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched &&
                    !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor={field.name}>
                    Token Name *
                  </FieldLabel>

                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="e.g. Special Darshan Tokens"
                    maxLength={100}
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
  name="max_limit"
  validators={{
    onSubmit: ({ value }) => {
      if (value === null) return undefined;

      if (
        !Number.isInteger(value) ||
        value < 1 ||
        value > 65535
      ) {
        return "Maximum tokens must be between 1 and 65535.";
      }

      return undefined;
    },
  }}
>
  {(field) => (
    <Field>
      <FieldLabel htmlFor={field.name}>
        Maximum Tokens
      </FieldLabel>

      <Input
        id={field.name}
        type="number"
        min={1}
        max={65535}
        step={1}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(event) => {
          const inputValue = event.target.value;

          field.handleChange(
            inputValue === "" ? null : Number(inputValue),
          );
        }}
        placeholder="Leave blank for unlimited"
        disabled={loading}
      />

      <FieldDescription>
        Leave blank for unlimited tokens.
      </FieldDescription>

      {field.state.meta.errors.length > 0 && (
        <FieldError>
          {field.state.meta.errors.join(", ")}
        </FieldError>
      )}
    </Field>
  )}
</form.Field>
            {/* Seva dropdown */}
   {/* Seva dropdown */}
<form.Field name="seva_id">
  {(field) => {
    const selectedSeva = sevas.find(
      (seva) => seva.id === field.state.value,
    );

    return (
      <Field>
        <FieldLabel htmlFor={field.name}>
          Seva Name
        </FieldLabel>

        <Select
          value={
            field.state.value != null
              ? String(field.state.value)
              : ""
          }
          onValueChange={(value) => {
            field.handleChange(
              value === "none" ? null : Number(value),
            );
            field.handleBlur();
          }}
          disabled={
            loading ||
            !selectedTempleId ||
            sevasLoading
          }
        >
          <SelectTrigger
            id={field.name}
            className="w-full capitalize cursor-pointer"
          >
            <SelectValue
              placeholder={
                !selectedTempleId
                  ? "Select a temple first"
                  : sevasLoading
                    ? "Loading sevas..."
                    : "Select a seva"
              }
            >
              {selectedSeva?.seva_name}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            

            {sevas.map((seva) => (
              <SelectItem
                key={seva.id}
                value={String(seva.id)}
              >
                {seva.seva_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <FieldDescription>
          Select a seva for the selected temple.
        </FieldDescription>
      </Field>
    );
  }}
</form.Field>

            {/* Deity dropdown */}
        {/* Deity dropdown */}
<form.Field name="deity_id">
  {(field) => {
    const selectedDeity = deities.find(
      (deity) => deity.id === field.state.value,
    );

    return (
      <Field>
        <FieldLabel htmlFor={field.name}>
          Deity Name
        </FieldLabel>

        <Select
          value={
            field.state.value != null
              ? String(field.state.value)
              : ""
          }
          onValueChange={(value) => {
            field.handleChange(
              value === "none" ? null : Number(value),
            );
            field.handleBlur();
          }}
          disabled={
            loading ||
            !selectedTempleId ||
            deitiesLoading
          }
        >
          <SelectTrigger
            id={field.name}
            className="w-full capitalize cursor-pointer"
          >
            <SelectValue
              placeholder={
                !selectedTempleId
                  ? "Select a temple first"
                  : deitiesLoading
                    ? "Loading deities..."
                    : "Select a deity"
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
          Select a deity for the selected temple.
        </FieldDescription>
      </Field>
    );
  }}
</form.Field>

            {/* Status */}
            <form.Field name="token_status">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Status *
                  </FieldLabel>

                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as TokenStatus)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full capitalize cursor-pointer"
                    >
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
             <form.Field name="token_display_order">
              {(field) => (
                <Field>
                  <FieldLabel>Display Order</FieldLabel>
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
            {/* Description */}
            <form.Field
              name="token_description"
              validators={{
                onSubmit: ({ value }) =>
                  value.length <= 500
                    ? undefined
                    : "Description cannot exceed 500 characters.",
              }}
            >
              {(field) => (
                <Field className="md:col-span-2 lg:col-span-3">
                  <FieldLabel htmlFor={field.name}>
                    Description
                  </FieldLabel>

                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="Enter token details"
                    maxLength={500}
                    disabled={loading}
                  />

                  <FieldDescription>
                    Optional. Maximum 500 characters.
                  </FieldDescription>

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
        </form>
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button
        className="capitalize cursor-pointer"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button className="capitalize cursor-pointer"
          type="submit"
          form="token-form"
          disabled={
            loading ||
            templesLoading ||
            temples.length === 0
          }
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Token"
              : "Create Token"}
        </Button>
      </CardFooter>
    </Card>
  );
}