// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// import { AlertCircle } from "lucide-react";

// import type { AppDispatch } from "@/app/store";

// import {
//   Alert,
//   AlertDescription,
//   AlertTitle,
// } from "@/components/ui/alert";

// import { Button } from "@/components/ui/button";
// import { showCmtToast } from "@/components/ui/cmt-toast";

// import BookingForm from "../components/BookigForm";

// import { createSevaBooking } from "../sevaBookingThunks";
// import { selectSevaBookingSaving } from "../sevaBookingSelectors";

// import { fetchTemples } from "../../temple/templeThunks";
// import {
//   selectTemples,
//   selectTempleLoading,
//   selectTempleError,
// } from "../../temple/templeSelectors";

// import { fetchSevas } from "../../seva/sevaThunks";
// import {
//   selectSevas,
//   selectSevaLoading,
//   selectSevaError,
// } from "../../seva/sevaSelectors";

// import { fetchDeities } from "../../deities/deityThunks";
// import {
//   selectDeities,
//   selectDeitiesLoading,
//   selectDeitiesError,
// } from "../../deities/deitySelectors";

// import type { CreateSevaBookingPayload } from "../sevaBookingTypes";

// export default function AddSevaBooking() {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const [error, setError] = useState("");
//   const [selectedTempleId, setSelectedTempleId] = useState(0);

//   // --------------------------------
//   // TEMPLE STATE
//   // --------------------------------

//   const temples = useSelector(selectTemples);
//   const templesLoading = useSelector(selectTempleLoading);
//   const templesError = useSelector(selectTempleError);

//   // --------------------------------
//   // SEVA STATE
//   // --------------------------------

//   const allSevas = useSelector(selectSevas);
//   const sevasLoading = useSelector(selectSevaLoading);
//   const sevasError = useSelector(selectSevaError);

//   // --------------------------------
//   // DEITY STATE
//   // --------------------------------

//   const allDeities = useSelector(selectDeities);
//   const deitiesLoading = useSelector(selectDeitiesLoading);
//   const deitiesError = useSelector(selectDeitiesError);

//   // --------------------------------
//   // BOOKING STATE
//   // --------------------------------

//   const saving = useSelector(selectSevaBookingSaving);

//   // --------------------------------
//   // INITIAL DATA
//   // --------------------------------

//   useEffect(() => {
//     void dispatch(fetchTemples());
//     void dispatch(fetchDeities());
//   }, [dispatch]);

//   // --------------------------------
//   // TEMPLE CHANGE
//   // --------------------------------

//   const handleTempleChange = useCallback((templeId: number) => {
//     setSelectedTempleId(templeId);
//   }, []);

//   // --------------------------------
//   // FETCH SEVAS BY TEMPLE
//   // --------------------------------

//   useEffect(() => {
//     if (selectedTempleId <= 0) {
//       return;
//     }

//     void dispatch(
//       fetchSevas({
//         page: 1,
//         limit: 100,
//         temple_id: selectedTempleId,
//       }),
//     );
//   }, [dispatch, selectedTempleId]);

//   // --------------------------------
//   // FILTER SEVAS BY SELECTED TEMPLE
//   // --------------------------------

//   const sevas = useMemo(() => {
//     if (!selectedTempleId) {
//       return [];
//     }

//     return allSevas.filter(
//       (seva) => Number(seva.temple_id) === selectedTempleId,
//     );
//   }, [allSevas, selectedTempleId]);

//   // --------------------------------
//   // FILTER DEITIES BY SELECTED TEMPLE
//   // --------------------------------

//   const deities = useMemo(() => {
//     if (!selectedTempleId) {
//       return [];
//     }

//     return allDeities.filter(
//       (deity) => Number(deity.temple_id) === selectedTempleId,
//     );
//   }, [allDeities, selectedTempleId]);

//   // --------------------------------
//   // RETRY FAILED REQUESTS
//   // --------------------------------

//   const retryLoading = () => {
//     setError("");

//     if (templesError) {
//       void dispatch(fetchTemples());
//     }

//     if (deitiesError) {
//       void dispatch(fetchDeities());
//     }

//     if (sevasError && selectedTempleId > 0) {
//       void dispatch(
//         fetchSevas({
//           page: 1,
//           limit: 100,
//           temple_id: selectedTempleId,
//         }),
//       );
//     }
//   };

//   // --------------------------------
//   // CREATE SEVA BOOKING
//   // --------------------------------

//   async function handleSubmit(data: CreateSevaBookingPayload) {
//     setError("");

//     try {
//       await dispatch(createSevaBooking(data)).unwrap();

//       showCmtToast(
//         "success",
//         "Seva booking created successfully.",
//       );

//       navigate("/seva_booking");
//     } catch (err: unknown) {
//       const message =
//         typeof err === "string"
//           ? err
//           : err instanceof Error
//             ? err.message
//             : "Failed to create seva booking.";

//       setError(message);
//     }
//   }

//   // --------------------------------
//   // ERROR MESSAGE
//   // --------------------------------

//   const loadError =
//     error || templesError || sevasError || deitiesError;

//   return (
//     <div className="w-full space-y-6">
//       {/* PAGE HEADER */}
//       <div>
//         <h1 className="text-2xl font-semibold">
//           Add Seva Booking
//         </h1>

//         <p className="text-sm text-muted-foreground">
//           Create a new devotee seva booking.
//         </p>
//       </div>

//       {/* ERROR ALERT */}
//       {loadError && (
//         <Alert variant="destructive">
//           <AlertCircle className="size-4" />

//           <AlertTitle>
//             Unable to Load or Save Seva Booking
//           </AlertTitle>

//           <AlertDescription>
//             {loadError}

//             <div className="mt-3">
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={retryLoading}
//               >
//                 Try Again
//               </Button>
//             </div>
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* BOOKING FORM */}
//       <BookingForm
//         temples={temples}
//         templesLoading={templesLoading}
//         sevas={sevas}
//         sevasLoading={sevasLoading}
//         deities={deities}
//         deitiesLoading={deitiesLoading}
//         selectedTempleId={selectedTempleId}
//         onTempleChange={handleTempleChange}
//         loading={saving}
//         onSubmit={handleSubmit}
//         onCancel={() => navigate("/seva_booking")}
//       />
//     </div>
//   );
// }


import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Printer,
} from "lucide-react";

import type { AppDispatch } from "@/app/store";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { showCmtToast } from "@/components/ui/cmt-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import BookingForm from "../components/BookigForm";

import {
  createSevaBooking,
  printSevaBookingReceipt,
} from "../sevaBookingThunks";

import { selectSevaBookingSaving } from "../sevaBookingSelectors";

import { fetchTemples } from "../../temple/templeThunks";
import {
  selectTemples,
  selectTempleLoading,
  selectTempleError,
} from "../../temple/templeSelectors";

import { fetchSevas } from "../../seva/sevaThunks";
import {
  selectSevas,
  selectSevaLoading,
  selectSevaError,
} from "../../seva/sevaSelectors";

import { fetchDeities } from "../../deities/deityThunks";
import {
  selectDeities,
  selectDeitiesLoading,
  selectDeitiesError,
} from "../../deities/deitySelectors";

import type { CreateSevaBookingPayload } from "../sevaBookingTypes";

type BookingCreateResult = {
  id?: number | string;
  booking_id?: number | string;
  data?: {
    id?: number | string;
    booking_id?: number | string;
  };
};

export default function AddSevaBooking() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [selectedTempleId, setSelectedTempleId] = useState(0);

  // Receipt dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState("");

  // TEMPLE STATE
  const temples = useSelector(selectTemples);
  const templesLoading = useSelector(selectTempleLoading);
  const templesError = useSelector(selectTempleError);

  // SEVA STATE
  const allSevas = useSelector(selectSevas);
  const sevasLoading = useSelector(selectSevaLoading);
  const sevasError = useSelector(selectSevaError);

  // DEITY STATE
  const allDeities = useSelector(selectDeities);
  const deitiesLoading = useSelector(selectDeitiesLoading);
  const deitiesError = useSelector(selectDeitiesError);

  // BOOKING STATE
  const saving = useSelector(selectSevaBookingSaving);

  // INITIAL DATA
  useEffect(() => {
    void dispatch(fetchTemples());
    void dispatch(fetchDeities());
  }, [dispatch]);

  // TEMPLE CHANGE
  const handleTempleChange = useCallback((templeId: number) => {
    setSelectedTempleId(templeId);
  }, []);

  // FETCH SEVAS BY TEMPLE
  useEffect(() => {
    if (selectedTempleId <= 0) return;

    void dispatch(
      fetchSevas({
        page: 1,
        limit: 100,
        temple_id: selectedTempleId,
      }),
    );
  }, [dispatch, selectedTempleId]);

  // FILTER SEVAS BY SELECTED TEMPLE
  const sevas = useMemo(() => {
    if (!selectedTempleId) return [];

    return allSevas.filter(
      (seva) => Number(seva.temple_id) === selectedTempleId,
    );
  }, [allSevas, selectedTempleId]);

  // FILTER DEITIES BY SELECTED TEMPLE
  const deities = useMemo(() => {
    if (!selectedTempleId) return [];

    return allDeities.filter(
      (deity) => Number(deity.temple_id) === selectedTempleId,
    );
  }, [allDeities, selectedTempleId]);

  // RETRY FAILED REQUESTS
  const retryLoading = () => {
    setError("");

    if (templesError) {
      void dispatch(fetchTemples());
    }

    if (deitiesError) {
      void dispatch(fetchDeities());
    }

    if (sevasError && selectedTempleId > 0) {
      void dispatch(
        fetchSevas({
          page: 1,
          limit: 100,
          temple_id: selectedTempleId,
        }),
      );
    }
  };

  // CREATE SEVA BOOKING
  async function handleSubmit(data: CreateSevaBookingPayload) {
    setError("");

    try {
      const result = (await dispatch(
        createSevaBooking(data),
      ).unwrap()) as BookingCreateResult;

      const id = Number(
        result?.booking_id ??
          result?.id ??
          result?.data?.booking_id ??
          result?.data?.id,
      );

      setCreatedBookingId(
        Number.isSafeInteger(id) && id > 0 ? id : null,
      );

      setPrintError("");
      setSuccessDialogOpen(true);

      showCmtToast(
        "success",
        "Seva booking created successfully.",
      );
    } catch (err: unknown) {
      const message =
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Failed to create seva booking.";

      setError(message);
    }
  }

  // PRINT SEVA BOOKING RECEIPT
  async function handlePrintReceipt() {
    if (!createdBookingId || printing) return;

    setPrinting(true);
    setPrintError("");

    // Open immediately from the click to avoid popup blockers.
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setPrintError("Please allow pop-ups to print the receipt.");
      setPrinting(false);
      return;
    }

    try {
      const html = await dispatch(
        printSevaBookingReceipt(createdBookingId),
      ).unwrap();

      if (typeof html !== "string" || !html.trim()) {
        throw new Error("The receipt response is empty.");
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err: unknown) {
      printWindow.close();

      setPrintError(
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Unable to print the seva booking receipt.",
      );
    } finally {
      setPrinting(false);
    }
  }

  // CLOSE DIALOG AND NAVIGATE
  function handleDone() {
    if (printing) return;

    setSuccessDialogOpen(false);
    navigate("/seva_booking");
  }

  const loadError =
    error || templesError || sevasError || deitiesError;

  return (
    <div className="w-full space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          Add Seva Booking
        </h1>

        <p className="text-sm text-muted-foreground">
          Create a new devotee seva booking.
        </p>
      </div>

      {/* ERROR ALERT */}
      {loadError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>
            Unable to Load or Save Seva Booking
          </AlertTitle>

          <AlertDescription>
            {loadError}

            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={retryLoading}
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* BOOKING FORM */}
      <BookingForm
        temples={temples}
        templesLoading={templesLoading}
        sevas={sevas}
        sevasLoading={sevasLoading}
        deities={deities}
        deitiesLoading={deitiesLoading}
        selectedTempleId={selectedTempleId}
        onTempleChange={handleTempleChange}
        loading={saving}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/seva_booking")}
      />

      {/* SUCCESS AND PRINT DIALOG */}
      <Dialog
        open={successDialogOpen}
        onOpenChange={(open) => {
          if (!printing && !open) {
            handleDone();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-green-600" />
              Seva Booking Created Successfully
            </DialogTitle>

            <DialogDescription>
              Your seva booking has been saved successfully.
              You can print the receipt now.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!createdBookingId && (
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription>
                  The booking was created, but the API did not
                  return its booking ID. Receipt printing is
                  unavailable.
                </AlertDescription>
              </Alert>
            )}

            {printError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>
                  {printError}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              className="w-full"
              variant="outline"
              disabled={!createdBookingId || printing}
              onClick={handlePrintReceipt}
            >
              {printing ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Preparing Receipt...
                </>
              ) : (
                <>
                  <Printer className="mr-2 size-4" />
                  Print Seva Booking Receipt
                </>
              )}
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleDone}
              disabled={printing}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
