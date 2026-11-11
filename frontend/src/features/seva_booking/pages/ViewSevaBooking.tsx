
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,

  Receipt,
  UserRound,
  IndianRupee,
} from "lucide-react";

import type { AppDispatch } from "@/app/store";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import {
  fetchSevaBookingById,
} from "../sevaBookingThunks";

import {
  selectSevaBooking,
  selectSevaBookingLoading,
  selectSevaBookingError,
} from "../sevaBookingSelectors";

import type { SevaBooking } from "../sevaBookingTypes";

interface InfoItemProps {
  label: string;
  value?: string | number | null;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="break-words text-sm font-medium">
        {value === null || value === undefined || value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const datePart = value.slice(0, 10);
  const parts = datePart.split("-");

  if (parts.length !== 3) return value;

  const [year, month, day] = parts;

  return `${day}-${month}-${year}`;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  const normalized = value.includes("T")
    ? value
    : value.replace(" ", "T");

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return String(value);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatusValue({ value }: { value?: string | null }) {
  if (!value) return <span>—</span>;

  return (
    <span className="inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize">
      {value.replaceAll("_", " ")}
    </span>
  );
}

export default function ViewSevaBooking() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const bookingId = Number(id);

  const booking = useSelector(selectSevaBooking);
  const loading = useSelector(selectSevaBookingLoading);
  const error = useSelector(selectSevaBookingError);

  useEffect(() => {
    if (
      !Number.isInteger(bookingId) ||
      bookingId <= 0
    ) {
      return;
    }

    void dispatch(fetchSevaBookingById(bookingId));
  }, [dispatch, bookingId]);

  const bookingMatchesRoute =
    booking?.id === bookingId;

  const goBack = () => {
    navigate("/seva_booking");
  };

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />

        <AlertTitle>Invalid Booking ID</AlertTitle>

        <AlertDescription>
          Please provide a valid booking ID.

          <div className="mt-3">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="mr-2 size-4" />
              Back to Bookings
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (loading && !bookingMatchesRoute) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading seva booking details...
        </p>
      </div>
    );
  }

  if (error || !bookingMatchesRoute) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Bookings
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>Unable to Load Booking</AlertTitle>

          <AlertDescription>
            {error || "Booking not found."}

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  void dispatch(fetchSevaBookingById(bookingId))
                }
              >
                Try Again
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={goBack}
              >
                Back
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const data: SevaBooking = booking;

  return (
    <div className="w-full space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Seva Booking Details
          </h1>

          <p className="text-sm text-muted-foreground">
            Complete booking, devotee, seva and payment information.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
          className="cursor-pointer"
            variant="outline"
            onClick={goBack}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>

          {/* <Button
            onClick={() =>
              navigate(`/seva_booking/edit/${data.id}`)
            }
          >
            <Pencil className="mr-2 size-4" />
            Edit Booking
          </Button> */}
        </div>
      </div>

      {/* BOOKING SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="Booking ID" value={data.id} />

          <InfoItem
            label="Organization ID"
            value={data.organization_id}
          />

          <InfoItem
            label="Temple ID"
            value={data.temple_id}
          />

          <InfoItem
            label="Booking Type"
            value={data.booking_type}
          />

          <div>
            <p className="mb-1 text-sm text-muted-foreground">
              Booking Status
            </p>
            <StatusValue value={data.booking_status} />
          </div>

          <div>
            <p className="mb-1 text-sm text-muted-foreground">
              Payment Status
            </p>
            <StatusValue value={data.booking_payment_status} />
          </div>

          <InfoItem
            label="Scheduled Date"
            value={formatDate(data.booking_scheduled_date)}
          />

          <InfoItem
            label="Scheduled Time"
            value={data.booking_scheduled_time}
          />
        </CardContent>
      </Card>

      {/* DEVOTEE DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5" />
            Devotee Details
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Devotee ID"
            value={data.devotee_id}
          />

          <InfoItem
            label="Devotee Name"
            value={data.devotee_name}
          />

          <InfoItem
            label="Mobile Number"
            value={data.devotee_phone}
          />

          <InfoItem
            label="Email"
            value={data.devotee_email}
          />

          <InfoItem
            label="Gotra"
            value={data.devotee_gotra}
          />

          <InfoItem
            label="Rashi"
            value={data.devotee_rashi}
          />

          <InfoItem
            label="Nakshatra"
            value={data.devotee_nakshatra}
          />
        </CardContent>
      </Card>

      {/* TEMPLE DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle>Temple Details</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Organization ID"
            value={data.organization_id}
          />

          <InfoItem
            label="Temple ID"
            value={data.temple_id}
          />

          <InfoItem
            label="Temple Name"
            value={data.temp_name}
          />
        </CardContent>
      </Card>

      {/* DEITY AND SEVA */}
      <Card>
        <CardHeader>
          <CardTitle>Deity & Seva Details</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Deity Name"
            value={data.deity_name}
          />

          <InfoItem
            label="Deity Code"
            value={data.deity_code}
          />

          <InfoItem
            label="Seva Name"
            value={data.seva_name}
          />

          <InfoItem
            label="Seva Code"
            value={data.seva_code}
          />
        </CardContent>
      </Card>

      {/* AMOUNT DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="size-5" />
            Amount & GST Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Seva Amount"
              value={formatAmount(data.seva_amount)}
            />

            <InfoItem
              label="GST Percentage"
              value={`${data.seva_gst_percent}%`}
            />

            <InfoItem
              label="GST Amount"
              value={formatAmount(data.booking_gst_amount)}
            />

            <InfoItem
              label="Total Booking Amount"
              value={formatAmount(data.booking_total_amount)}
            />
          </div>
        </CardContent>
      </Card>

      {/* PAYMENT AND RECEIPT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            Payment & Receipt Details
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Payment Status"
            value={data.booking_payment_status}
          />

          <InfoItem
            label="Payment Method"
            value={data.booking_payment_method}
          />

          <InfoItem
            label="Paid At"
            value={formatDateTime(data.booking_paid_at)}
          />

          <InfoItem
            label="Receipt Number"
            value={data.booking_receipt_number}
          />

          <InfoItem
            label="Receipt Generated At"
            value={formatDateTime(data.booking_receipt_generated_at)}
          />
        </CardContent>
      </Card>

      {/* REMARKS */}
      <Card>
        <CardHeader>
          <CardTitle>Remarks & Internal Notes</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Booking Remark
            </p>

            <p className="whitespace-pre-wrap text-sm font-medium">
              {data.booking_remark || "—"}
            </p>
          </div>

          <Separator className="md:hidden" />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Internal Note
            </p>

            <p className="whitespace-pre-wrap text-sm font-medium">
              {data.booking_internal_note || "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* RECORD AUDIT DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5" />
            Record & Audit Details
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Created By User ID"
            value={data.created_by_user_id}
          />

          <InfoItem
            label="Created At"
            value={formatDateTime(data.created_at)}
          />

          <InfoItem
            label="Updated At"
            value={formatDateTime(data.updated_at)}
          />

          <InfoItem
            label="Deleted At"
            value={formatDateTime(data.deleted_at)}
          />
        </CardContent>
      </Card>

      {/* FOOTER */}
      <div className="flex justify-end">
        <Button
        className="cursor-pointer"
          variant="outline"
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Bookings
        </Button>
      </div>
    </div>
  );
}
