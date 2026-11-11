
import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";

import { devoteeService } from "../../devotee/services/devoteeService";

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
import { OptionSelect } from "@/components/ui/option-select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { startOfToday } from "@/features/donations/shared/donationFormLogic";
import { LiveValidationContext } from "@/hooks/useLiveValidation";
import { validateValue } from "@/lib/validation";
import { GOTRA_OPTIONS, NAKSHATRA_OPTIONS, RASHI_OPTIONS } from "@/lib/hindu-options";

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
  CreateSevaBookingPayload,
  SevaBooking,
} from "../sevaBookingTypes";

interface SevaBookingFormProps {
  temples: Temple[];
  templesLoading: boolean;

  sevas: Seva[];
  sevasLoading: boolean;

  deities: Deity[];
  deitiesLoading: boolean;

  selectedTempleId: number;
  onTempleChange: (templeId: number) => void;

  loading: boolean;
  initialValues?: SevaBooking;

  onSubmit: (data: CreateSevaBookingPayload) => Promise<void>;
  onCancel: () => void;
}

type DevoteeSearchResult = Awaited<
  ReturnType<typeof devoteeService.search>
>[number];

const today = new Date().toLocaleDateString("en-CA");

export default function BookingForm({
  temples,
  templesLoading,
  sevas,
  sevasLoading,
  deities,
  deitiesLoading,
  selectedTempleId,
  onTempleChange,
  loading,
  initialValues,
  onSubmit,
  onCancel,
}: SevaBookingFormProps) {
  const isEditMode = Boolean(initialValues);

  // =========================================================
  // DEVOTEE SEARCH STATE
  // =========================================================

  const [devoteeSearchTerm, setDevoteeSearchTerm] = useState(
    initialValues?.devotee_name ?? "",
  );

  const [devoteeResults, setDevoteeResults] = useState<
    DevoteeSearchResult[]
  >([]);

  const [devoteeSearchLoading, setDevoteeSearchLoading] = useState(false);

  const [showDevoteeSuggestions, setShowDevoteeSuggestions] =
    useState(false);

  const [selectedDevoteeId, setSelectedDevoteeId] = useState<
    number | null
  >(initialValues?.devotee_id ?? null);

  const devoteeSearchRef = useRef<HTMLDivElement>(null);

  // =========================================================
  // FORM
  // =========================================================

  const form = useForm({
    defaultValues: {
      temple_id: initialValues?.temple_id ?? 0,

      booking_type: initialValues?.booking_type ?? ("one_time" as const),

      devotee_id: initialValues?.devotee_id ?? null,

      devotee_name: initialValues?.devotee_name ?? "",
      devotee_phone: initialValues?.devotee_phone ?? "",
      devotee_email: initialValues?.devotee_email ?? "",

      devotee_gotra: initialValues?.devotee_gotra ?? "",
      devotee_rashi: initialValues?.devotee_rashi ?? "",
      devotee_nakshatra: initialValues?.devotee_nakshatra ?? "",

      deity_id: initialValues?.deity_id ?? (null as number | null),
      seva_id: initialValues?.seva_id ?? (null as number | null),

      deity_name: initialValues?.deity_name ?? "",
      deity_code: initialValues?.deity_code ?? "",
      seva_name: initialValues?.seva_name ?? "",
      seva_code: initialValues?.seva_code ?? "",

      booking_scheduled_date:
        initialValues?.booking_scheduled_date?.slice(0, 10) ?? today,

      booking_scheduled_time:
        initialValues?.booking_scheduled_time?.slice(0, 5) ?? "09:30",

      booking_remark: initialValues?.booking_remark ?? "",
      booking_internal_note: initialValues?.booking_internal_note ?? "",
    },

    onSubmit: async ({ value }) => {
      await onSubmit({
        temple_id: value.temple_id,

        booking_type: "one_time",

        devotee_id: value.devotee_id,

        devotee_name: value.devotee_name.trim(),
        devotee_phone: value.devotee_phone.trim(),
        devotee_email: value.devotee_email.trim() || null,

        devotee_gotra: value.devotee_gotra.trim() || null,
        devotee_rashi: value.devotee_rashi.trim() || null,
        devotee_nakshatra: value.devotee_nakshatra.trim() || null,

        deity_name: value.deity_name.trim() || "",
        deity_code: value.deity_code.trim() || "",

        seva_code: value.seva_code.trim(),

        booking_scheduled_date: value.booking_scheduled_date,

        booking_scheduled_time: value.booking_scheduled_time
          ? `${value.booking_scheduled_time.slice(0, 5)}:00`
          : null,

        booking_remark: value.booking_remark.trim() || null,

        booking_internal_note:
          value.booking_internal_note.trim() || null,
      });
    },
  });

 
useEffect(() => {
  // A selected devotee must not trigger another search.
  if (selectedDevoteeId !== null) return;

  const searchTerm = devoteeSearchTerm.trim();

  // Short search terms are handled in the input change handler.
  if (searchTerm.length < 2) return;

  let cancelled = false;

  const timer = window.setTimeout(async () => {
    setDevoteeSearchLoading(true);

    try {
      const results = await devoteeService.search(searchTerm);

      if (cancelled) return;

      setDevoteeResults(results);
      setShowDevoteeSuggestions(true);
    } catch (error) {
      if (cancelled) return;

      console.error("Devotee search failed:", error);
      setDevoteeResults([]);
      setShowDevoteeSuggestions(true);
    } finally {
      if (!cancelled) {
        setDevoteeSearchLoading(false);
      }
    }
  }, 350);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}, [devoteeSearchTerm, selectedDevoteeId]);

  // =========================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        devoteeSearchRef.current &&
        !devoteeSearchRef.current.contains(event.target as Node)
      ) {
        setShowDevoteeSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // =========================================================
  // SELECT EXISTING DEVOTEE
  // =========================================================

  function handleSelectDevotee(devotee: DevoteeSearchResult) {
    const devoteeId = Number(devotee.id);

    // Prevent another search after selection.
    setSelectedDevoteeId(devoteeId);

    // Populate all devotee form fields.
    form.setFieldValue("devotee_id", devoteeId);
    form.setFieldValue("devotee_name", devotee.devotee_name ?? "");
    form.setFieldValue("devotee_phone", devotee.devotee_phone ?? "");
    form.setFieldValue("devotee_email", devotee.devotee_email ?? "");
    form.setFieldValue("devotee_gotra", devotee.devotee_gotra ?? "");
    form.setFieldValue("devotee_rashi", devotee.devotee_rashi ?? "");
    form.setFieldValue(
      "devotee_nakshatra",
      devotee.devotee_nakshatra ?? "",
    );

    // Keep the selected name in the search input.
    setDevoteeSearchTerm(devotee.devotee_name ?? "");

    // Close and clear suggestions.
    setShowDevoteeSuggestions(false);
    setDevoteeResults([]);
    setDevoteeSearchLoading(false);
  }

  // =========================================================
  // SEARCH INPUT CHANGE
  // =========================================================



  
function handleDevoteeSearchChange(value: string) {
  setDevoteeSearchTerm(value);
  setSelectedDevoteeId(null);

  form.setFieldValue("devotee_id", null);
  form.setFieldValue("devotee_name", "");
  form.setFieldValue("devotee_phone", "");
  form.setFieldValue("devotee_email", "");
  form.setFieldValue("devotee_gotra", "");
  form.setFieldValue("devotee_rashi", "");
  form.setFieldValue("devotee_nakshatra", "");

  setDevoteeResults([]);
  setDevoteeSearchLoading(false);
  setShowDevoteeSuggestions(value.trim().length >= 2);
}

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Card className="w-full overflow-visible">
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Edit Seva Booking" : "Create Seva Booking"}
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Enter devotee, temple, deity, seva and booking schedule details.
        </p>
      </CardHeader>

      <CardContent className="overflow-visible">
        <form
          id="seva-booking-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
          noValidate
        >
          <LiveValidationContext.Provider value>
          <FieldGroup className="grid grid-cols-1 gap-5 overflow-visible md:grid-cols-2 lg:grid-cols-3">

            {/* =================================================
                EXISTING DEVOTEE SEARCH
            ================================================= */}

            <Field
              className={`relative min-w-0 ${
                showDevoteeSuggestions ? "z-60" : "z-0"
              }`}
            >
              <div ref={devoteeSearchRef} className="relative w-full">
                <FieldLabel htmlFor="devotee-search">
                  Search Existing Devotee
                </FieldLabel>

                <Input
                  id="devotee-search"
                  value={devoteeSearchTerm}
                  onChange={(event) =>
                    handleDevoteeSearchChange(event.target.value)
                  }
                  onFocus={() => {
                    if (
                      selectedDevoteeId === null &&
                      devoteeSearchTerm.trim().length >= 2
                    ) {
                      setShowDevoteeSuggestions(true);
                    }
                  }}
                  placeholder="Search by name, mobile number or email..."
                  disabled={loading}
                  autoComplete="off"
                />

                <FieldDescription>
                  Search registered devotees and select one to automatically
                  fill their details.
                </FieldDescription>

                {devoteeSearchLoading && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Searching devotees...
                  </p>
                )}

                {selectedDevoteeId !== null && (
                  <p className="mt-1 text-xs text-green-600">
                    Devotee selected. You can edit the details below.
                  </p>
                )}

                {/* SEARCH RESULTS DROPDOWN */}

                {showDevoteeSuggestions &&
                  selectedDevoteeId === null &&
                  !devoteeSearchLoading && (
                    <div className="absolute left-0 right-0 top-full z-100 mt-2 w-full overflow-hidden rounded-lg border bg-background shadow-xl">

                      {devoteeResults.length > 0 ? (
                        <>
                          <div className="border-b bg-muted/50 px-3 py-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              {devoteeResults.length} devotee(s) found
                            </p>
                          </div>

                          {/* SCROLLABLE RESULTS */}

                          <div
                            className="max-h-56 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y"
                            onWheel={(event) => event.stopPropagation()}
                          >
                            {devoteeResults.map((devotee) => (
                              <button
                                key={devotee.id}
                                type="button"
                                onClick={() =>
                                  handleSelectDevotee(devotee)
                                }
                                className="flex w-full flex-col gap-1 border-b px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                              >
                                <span className="text-sm font-semibold">
                                  {devotee.devotee_name}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                  {devotee.devotee_phone || "No mobile number"}
                                  {" • "}
                                  {devotee.devotee_email || "No email"}
                                </span>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-sm font-medium">
                            No existing devotee found
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            You can enter new devotee details manually below.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </Field>

            {/* =================================================
                TEMPLE
            ================================================= */}

            <form.Field
              name="temple_id"
              validators={{
                onSubmit: ({ value }) =>
                  value > 0 ? undefined : "Please select a temple.",
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

                        form.setFieldValue("seva_id", null);
                        form.setFieldValue("seva_name", "");
                        form.setFieldValue("seva_code", "");

                        form.setFieldValue("deity_id", null);
                        form.setFieldValue("deity_name", "");
                        form.setFieldValue("deity_code", "");

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

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* =================================================
                SEVA
            ================================================= */}

            <form.Field
              name="seva_id"
              validators={{
                onSubmit: ({ value }) =>
                  value && value > 0
                    ? undefined
                    : "Please select a seva.",
              }}
            >
              {(field) => {
                const selectedSeva = sevas.find(
                  (seva) => seva.id === field.state.value,
                );

                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Seva Name *
                    </FieldLabel>

                    <Select
                      value={
                        field.state.value
                          ? String(field.state.value)
                          : ""
                      }
                      // onValueChange={(value) => {
                      //   const sevaId = Number(value);

                      //   const selected = sevas.find(
                      //     (seva) => seva.id === sevaId,
                      //   );

                      //   field.handleChange(sevaId);
                      //   field.handleBlur();

                      //   form.setFieldValue(
                      //     "seva_name",
                      //     selected?.seva_name ?? "",
                      //   );

                      //   form.setFieldValue(
                      //     "seva_code",
                      //     selected?.seva_code ?? "",
                      //   );
                      // }}

onValueChange={(value) => {
  const sevaId = Number(value);

  const selected = sevas.find(
    (seva) => Number(seva.id) === sevaId,
  );

  field.handleChange(sevaId);
  field.handleBlur();

  form.setFieldValue(
    "seva_name",
    selected?.seva_name ?? "",
  );

  form.setFieldValue(
    "seva_code",
    selected?.seva_code ?? "",
  );

  // Automatically select the deity associated with this seva.
  const deityId = selected?.deity_id
    ? Number(selected.deity_id)
    : null;

  form.setFieldValue("deity_id", deityId);

  // Update deity name and code.
  const selectedDeity = deities.find(
    (deity) => Number(deity.id) === deityId,
  );

  form.setFieldValue(
    "deity_name",
    selectedDeity?.deity_name ?? "",
  );

  form.setFieldValue(
    "deity_code",
    selectedDeity?.deity_code ?? "",
  );
}}

                      disabled={
                        loading ||
                        !selectedTempleId ||
                        sevasLoading ||
                        sevas.length === 0
                      }
                    >
                      <SelectTrigger
                        id={field.name}
                        className="w-full cursor-pointer"
                        aria-invalid={invalid}
                      >
                        <SelectValue
                          placeholder={
                            !selectedTempleId
                              ? "Select a temple first"
                              : sevasLoading
                                ? "Loading sevas..."
                                : sevas.length === 0
                                  ? "No sevas available"
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
                            {seva.seva_name} — ₹
                            {Number(seva.seva_amount ?? 0).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FieldDescription>
                      Select a seva for the selected temple.
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

            {/* =================================================
                DEITY
            ================================================= */}

            {/* <form.Field
              name="deity_id"
              validators={{
                onSubmit: ({ value }) =>
                  value && value > 0
                    ? undefined
                    : "Please select a deity.",
              }}
            >
              {(field) => {
                const selectedDeity = deities.find(
                  (deity) => deity.id === field.state.value,
                );

                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Deity Name *
                    </FieldLabel>

                    <Select
                      value={
                        field.state.value
                          ? String(field.state.value)
                          : ""
                      }
                      onValueChange={(value) => {
                        const deityId = Number(value);

                        const selected = deities.find(
                          (deity) => deity.id === deityId,
                        );

                        field.handleChange(deityId);
                        field.handleBlur();

                        form.setFieldValue(
                          "deity_name",
                          selected?.deity_name ?? "",
                        );

                        form.setFieldValue(
                          "deity_code",
                          selected?.deity_code ?? "",
                        );
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
                        aria-invalid={invalid}
                      >
                        <SelectValue
                          placeholder={
                            !selectedTempleId
                              ? "Select a temple first"
                              : deitiesLoading
                                ? "Loading deities..."
                                : deities.length === 0
                                  ? "No deities available"
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

                    {invalid && field.state.meta.errors.length > 0 && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field> */}


            <form.Field name="deity_id">
              {(field) => {
                const selectedDeity = deities.find(
                  (deity) => Number(deity.id) === Number(field.state.value),
                );

                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
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
                        const deityId = value ? Number(value) : null;

                        const selected = deities.find(
                          (deity) => Number(deity.id) === deityId,
                        );

                        field.handleChange(deityId);
                        field.handleBlur();

                        form.setFieldValue(
                          "deity_name",
                          selected?.deity_name ?? "",
                        );

                        form.setFieldValue(
                          "deity_code",
                          selected?.deity_code ?? "",
                        );
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
                        aria-invalid={invalid}
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
                      You can leave this field empty if the seva is not associated with a specific deity.
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


            {/* =================================================
                BOOKING TYPE
            ================================================= */}

            <form.Field name="booking_type">
              {() => (
                <Field>
                  <FieldLabel>Booking Type *</FieldLabel>

                  <Select value="one_time" disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select booking type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="one_time">
                        One Time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            {/* =================================================
                DEVOTEE NAME
            ================================================= */}

            <form.Field
              name="devotee_name"
              validators={{
                onSubmit: ({ value }) =>
                  value.trim().length >= 2
                    ? undefined
                    : "Enter devotee name.",
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel>Devotee Name *</FieldLabel>

                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="Enter devotee name"
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
              name="devotee_phone"
              validators={{
                onSubmit: ({ value }) =>
                  value.trim() ? validateValue("phone", value) || undefined : "Enter mobile number.",
              }}
            >
              {(field) => {
                const invalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>Mobile Number *</FieldLabel>

                    <Input
                      id={field.name}
                      type="tel"
                      inputMode="numeric"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value.replace(/\D/g, ""))}
                      placeholder="9876543210"
                      disabled={loading}
                      aria-invalid={invalid}
                    />

                    {invalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="devotee_email"
              validators={{
                onSubmit: ({ value }) => validateValue("email", value) || undefined,
              }}
            >
              {(field) => {
                const invalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                    <Input
                      id={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="devotee@gmail.com"
                      maxLength={150}
                      disabled={loading}
                      aria-invalid={invalid}
                    />

                    {invalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                  </Field>
                );
              }}
            </form.Field>

            {([
              ["devotee_gotra", "Gotra", GOTRA_OPTIONS],
              ["devotee_rashi", "Rashi", RASHI_OPTIONS],
              ["devotee_nakshatra", "Nakshatra", NAKSHATRA_OPTIONS],
            ] as const).map(([name, label, options]) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

                    <OptionSelect
                      id={field.name}
                      value={field.state.value}
                      options={options}
                      placeholder={`Select ${label.toLowerCase()}`}
                      onChange={field.handleChange}
                      onBlur={field.handleBlur}
                      disabled={loading}
                    />
                  </Field>
                )}
              </form.Field>
            ))}

            <form.Field
              name="booking_scheduled_date"
              validators={{
                onSubmit: ({ value }) => (value ? undefined : "Select booking date."),
              }}
            >
              {(field) => {
                const invalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>Scheduled Date *</FieldLabel>

                    <DatePicker
                      id={field.name}
                      value={field.state.value}
                      minDate={isEditMode ? undefined : startOfToday()}
                      onChange={(value) => {
                        field.handleChange(value);
                        field.handleBlur();
                      }}
                      disabled={loading}
                      invalid={invalid}
                      className="w-full"
                    />

                    {invalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="booking_scheduled_time"
              validators={{
                onSubmit: ({ value }) => (value ? undefined : "Select booking time."),
              }}
            >
              {(field) => {
                const invalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel htmlFor={field.name}>Scheduled Time *</FieldLabel>

                    <TimePicker
                      id={field.name}
                      ariaLabel="Scheduled time"
                      value={field.state.value.slice(0, 5)}
                      onChange={(value) => {
                        field.handleChange(value);
                        field.handleBlur();
                      }}
                      disabled={loading}
                      invalid={invalid}
                      className="w-full"
                    />

                    {invalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                  </Field>
                );
              }}
            </form.Field>

            {/* =================================================
                BOOKING REMARK
            ================================================= */}

            <form.Field name="booking_remark">
              {(field) => (
                <Field className="md:col-span-2 lg:col-span-3">
                  <FieldLabel>Booking Remark</FieldLabel>

                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="Enter booking remarks"
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>

            {/* =================================================
                INTERNAL NOTE
            ================================================= */}

            <form.Field name="booking_internal_note">
              {(field) => (
                <Field className="md:col-span-2 lg:col-span-3">
                  <FieldLabel>Internal Note</FieldLabel>

                  <FieldDescription>
                    This note is visible to authorized temple staff only.
                  </FieldDescription>

                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder="Enter internal note"
                    disabled={loading}
                  />
                </Field>
              )}
            </form.Field>

          </FieldGroup>
          </LiveValidationContext.Provider>
        </form>
      </CardContent>

      {/* =====================================================
          FOOTER BUTTONS
      ===================================================== */}

      <CardFooter className="justify-end gap-2">
        <Button
          className="cursor-pointer"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          className="cursor-pointer"
          type="submit"
          form="seva-booking-form"
          disabled={
            loading ||
            templesLoading ||
            temples.length === 0 ||
            !selectedTempleId ||
            sevasLoading ||
            deitiesLoading
          }
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Booking"
              : "Create Booking"}
        </Button>
      </CardFooter>
    </Card>
  );
}
