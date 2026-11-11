
// // import { useEffect } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { useNavigate, useParams } from "react-router-dom";

// // import { showCmtToast } from "@/components/ui/cmt-toast";
// // import type { AppDispatch } from "@/app/store";

// // import SevaForm from "../components/SevaForm";
// // import {
// //   fetchSevaById,
// //   updateSeva,
// // } from "../sevaThunks";
// // import {
// //   selectSeva,
// //   selectSevaLoading,
// //   selectSevaSaving,
// //   selectSevaError,
// // } from "../sevaSelectors";

// // import { fetchTemples } from "../../temple/templeThunks";
// // import {
// //   selectTemples,
// //   selectTempleLoading,
// // } from "../../temple/templeSelectors";

// // import {
// //   Alert,
// //   AlertDescription,
// //   AlertTitle,
// // } from "@/components/ui/alert";

// // export default function EditSeva() {
// //   const dispatch = useDispatch<AppDispatch>();
// //   const navigate = useNavigate();
// //   const { id } = useParams<{ id: string }>();

// //   const seva = useSelector(selectSeva);
// //   const loading = useSelector(selectSevaLoading);
// //   const saving = useSelector(selectSevaSaving);
// //   const error = useSelector(selectSevaError);

// //   const temples = useSelector(selectTemples);
// //   const templesLoading = useSelector(selectTempleLoading);

  
// //   useEffect(() => {
// //     if (!id || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
// //       navigate("/sevas", { replace: true });
// //       return;
// //     }

// //     void dispatch(fetchSevaById(Number(id)));
// //     void dispatch(fetchTemples());
// //   }, [dispatch, id, navigate]);

// //   if (loading && !seva) {
// //     return <p className="p-4">Loading Seva...</p>;
// //   }

// //   if (!seva) {
// //     return (
// //       <Alert variant="destructive">
// //         <AlertTitle>Unable to Load Seva</AlertTitle>
// //         <AlertDescription>
// //           {error || "Seva not found."}
// //         </AlertDescription>
// //       </Alert>
// //     );
// //   }

// //   return (
// //     <div className="w-full space-y-6">
// //       <div>
// //         <h1 className="text-2xl font-semibold">Edit Seva</h1>
// //         <p className="text-sm text-muted-foreground">
// //           Update Seva details and settings.
// //         </p>
// //       </div>

// //       <SevaForm
// //         key={seva.id}
// //         initialValues={seva}
// //         temples={temples}
// //         templesLoading={templesLoading}
// //         loading={saving || loading}
// //         onSubmit={async (data) => {
// //           try {
// //             await dispatch(
// //               updateSeva({
// //                 id: seva.id,
// //                 payload: data,
// //               }),
// //             ).unwrap();
// //             showCmtToast("success", "Seva updated successfully.");
// //             navigate("/sevas");
// //           } catch (err: unknown) {
// //             showCmtToast(
// //               "expiry",
// //               typeof err === "string"
// //                 ? err
// //                 : err instanceof Error
// //                   ? err.message
// //                   : "Failed to update Seva.",
// //             );
// //           }
// //         }}
// //         onCancel={() => navigate("/sevas")}
// //       />
// //     </div>
// //   );
// // }



// import {
//   useCallback,
//   useEffect,
//   useState,
// } from "react";

// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";

// import { AlertCircle } from "lucide-react";

// import { showCmtToast } from "@/components/ui/cmt-toast";
// import type { AppDispatch } from "@/app/store";

// import SevaForm from "../components/SevaForm";

// import {
//   fetchSevaById,
//   updateSeva,
// } from "../sevaThunks";

// import {
//   selectSeva,
//   selectSevaLoading,
//   selectSevaSaving,
//   selectSevaError,
// } from "../sevaSelectors";

// import { fetchTemples } from "../../temple/templeThunks";

// import {
//   selectTemples,
//   selectTempleLoading,
//   selectTempleError,
// } from "../../temple/templeSelectors";

// import { fetchDeities } from "../../deities/deityThunks";

// import {
//   selectDeities,
//   selectDeitiesLoading,
//   selectDeitiesError,
// } from "../../deities/deitySelectors";

// import {
//   Alert,
//   AlertDescription,
//   AlertTitle,
// } from "@/components/ui/alert";

// import { Button } from "@/components/ui/button";

// export default function EditSeva() {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const { id } = useParams<{ id: string }>();

//   // Seva selectors
//   const seva = useSelector(selectSeva);
//   const loading = useSelector(selectSevaLoading);
//   const saving = useSelector(selectSevaSaving);
//   const error = useSelector(selectSevaError);

//   // Temple selectors
//   const temples = useSelector(selectTemples);
//   const templesLoading = useSelector(selectTempleLoading);
//   const templesError = useSelector(selectTempleError);

//   // Deity selectors
//   const allDeities = useSelector(selectDeities);
//   const deitiesLoading = useSelector(selectDeitiesLoading);
//   const deitiesError = useSelector(selectDeitiesError);

//   // Selected temple state
//   const [selectedTempleId, setSelectedTempleId] =
//     useState<number>(0);

//   // Validate ID and load data
//   useEffect(() => {
//     const sevaId = Number(id);

//     if (
//       !id ||
//       !Number.isSafeInteger(sevaId) ||
//       sevaId <= 0
//     ) {
//       navigate("/sevas", { replace: true });
//       return;
//     }

//     void dispatch(fetchSevaById(sevaId));
//     void dispatch(fetchTemples());
//     void dispatch(fetchDeities());
//   }, [dispatch, id, navigate]);

//   // Set selected temple after Seva is loaded.
//   useEffect(() => {
//     if (seva?.temple_id) {
//       setSelectedTempleId(Number(seva.temple_id));
//     }
//   }, [seva?.id, seva?.temple_id]);

//   // Handle temple change.
//   const handleTempleChange = useCallback(
//     (templeId: number) => {
//       setSelectedTempleId(templeId);
//     },
//     [],
//   );

//   // Filter deities based on selected temple.
//   const deities = allDeities.filter(
//     (deity) =>
//       Number(deity.temple_id) === selectedTempleId,
//   );

//   // Loading state
//   if (loading && (!seva || Number(seva.id) !== Number(id))) {
//     return (
//       <p className="p-4">Loading Seva...</p>
//     );
//   }

//   // Error state
//   if (!seva || Number(seva.id) !== Number(id)) {
//     return (
//       <Alert variant="destructive">
//         <AlertCircle className="size-4" />

//         <AlertTitle>
//           Unable to Load Seva
//         </AlertTitle>

//         <AlertDescription>
//           {error || "Seva not found."}
//         </AlertDescription>

//         <Button
//           type="button"
//           variant="outline"
//           size="sm"
//           onClick={() => {
//             if (id) {
//               void dispatch(fetchSevaById(Number(id)));
//             }
//           }}
//         >
//           Try Again
//         </Button>
//       </Alert>
//     );
//   }

//   return (
//     <div className="w-full space-y-6">
//       <div>
//         <h1 className="text-2xl font-semibold">
//           Edit Seva
//         </h1>

//         <p className="text-sm text-muted-foreground">
//           Update Seva details and settings.
//         </p>
//       </div>

//       {templesError && (
//         <Alert variant="destructive">
//           <AlertCircle className="size-4" />

//           <AlertTitle>
//             Unable to Load Temples
//           </AlertTitle>

//           <AlertDescription>
//             {templesError}
//           </AlertDescription>

//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             onClick={() => void dispatch(fetchTemples())}
//           >
//             Try Again
//           </Button>
//         </Alert>
//       )}

//       {deitiesError && (
//         <Alert variant="destructive">
//           <AlertCircle className="size-4" />

//           <AlertTitle>
//             Unable to Load Deities
//           </AlertTitle>

//           <AlertDescription>
//             {deitiesError}
//           </AlertDescription>

//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             onClick={() => void dispatch(fetchDeities())}
//           >
//             Try Again
//           </Button>
//         </Alert>
//       )}

//       <SevaForm
//         key={seva.id}
//         initialValues={seva}
//         temples={temples}
//         templesLoading={templesLoading}
//         loading={saving || loading}
//         deities={deities}
//         deitiesLoading={deitiesLoading}
//         selectedTempleId={selectedTempleId}
//         onTempleChange={handleTempleChange}
//         onSubmit={async (data) => {
//           try {
//             await dispatch(
//               updateSeva({
//                 id: seva.id,
//                 payload: {
//                   ...data,
//                   deity_id: data.deity_id ?? null,
//                 },
//               }),
//             ).unwrap();

//             showCmtToast(
//               "success",
//               "Seva updated successfully.",
//             );

//             navigate("/sevas");
//           } catch (err: unknown) {
//             showCmtToast(
//               "expiry",
//               typeof err === "string"
//                 ? err
//                 : err instanceof Error
//                   ? err.message
//                   : "Failed to update Seva.",
//             );
//           }
//         }}
//         onCancel={() => navigate("/sevas")}
//       />
//     </div>
//   );
// }





import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { AlertCircle } from "lucide-react";

import { showCmtToast } from "@/components/ui/cmt-toast";
import type { AppDispatch } from "@/app/store";

import SevaForm from "../components/SevaForm";

import {
  fetchSevaById,
  updateSeva,
} from "../sevaThunks";

import {
  selectSeva,
  selectSevaLoading,
  selectSevaSaving,
  selectSevaError,
} from "../sevaSelectors";

import { fetchTemples } from "../../temple/templeThunks";

import {
  selectTemples,
  selectTempleLoading,
  selectTempleError,
} from "../../temple/templeSelectors";

import { fetchDeities } from "../../deities/deityThunks";

import {
  selectDeities,
  selectDeitiesLoading,
  selectDeitiesError,
} from "../../deities/deitySelectors";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { Button } from "@/components/ui/button";

export default function EditSeva() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const currentSevaId = Number(id);

  // Seva selectors
  const seva = useSelector(selectSeva);
  const loading = useSelector(selectSevaLoading);
  const saving = useSelector(selectSevaSaving);
  const error = useSelector(selectSevaError);

  // Temple selectors
  const temples = useSelector(selectTemples);
  const templesLoading = useSelector(selectTempleLoading);
  const templesError = useSelector(selectTempleError);

  // Deity selectors
  const allDeities = useSelector(selectDeities);
  const deitiesLoading = useSelector(selectDeitiesLoading);
  const deitiesError = useSelector(selectDeitiesError);

  // Store only manual temple selection.
  const [templeSelection, setTempleSelection] = useState<{
    sevaId: number;
    templeId: number;
  } | null>(null);

  // Derive selected temple from manual selection or loaded seva.
  const selectedTempleId =
    templeSelection?.sevaId === currentSevaId
      ? templeSelection.templeId
      : Number(seva?.temple_id ?? 0);

  // Validate ID and load data.
  useEffect(() => {
    if (
      !id ||
      !Number.isSafeInteger(currentSevaId) ||
      currentSevaId <= 0
    ) {
      navigate("/sevas", { replace: true });
      return;
    }

    void dispatch(fetchSevaById(currentSevaId));
    void dispatch(fetchTemples());
    void dispatch(fetchDeities());
  }, [dispatch, id, currentSevaId, navigate]);

  // Handle temple selection.
  const handleTempleChange = useCallback(
    (templeId: number) => {
      setTempleSelection({
        sevaId: currentSevaId,
        templeId,
      });
    },
    [currentSevaId],
  );

  // Filter deities by selected temple.
  const deities = allDeities.filter(
    (deity) =>
      Number(deity.temple_id) === selectedTempleId,
  );

  // Prevent showing stale seva when URL ID changes.
  if (
    loading &&
    (!seva || Number(seva.id) !== currentSevaId)
  ) {
    return (
      <p className="p-4">
        Loading Seva...
      </p>
    );
  }

  // Seva not found.
  if (
    !seva ||
    Number(seva.id) !== currentSevaId
  ) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />

        <AlertTitle>
          Unable to Load Seva
        </AlertTitle>

        <AlertDescription>
          {error || "Seva not found."}
        </AlertDescription>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (id) {
              void dispatch(fetchSevaById(Number(id)));
            }
          }}
        >
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Edit Seva
        </h1>

        <p className="text-sm text-muted-foreground">
          Update Seva details and settings.
        </p>
      </div>

      {/* Temple error */}
      {templesError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>
            Unable to Load Temples
          </AlertTitle>

          <AlertDescription>
            {templesError}
          </AlertDescription>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void dispatch(fetchTemples())}
          >
            Try Again
          </Button>
        </Alert>
      )}

      {/* Deity error */}
      {deitiesError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>
            Unable to Load Deities
          </AlertTitle>

          <AlertDescription>
            {deitiesError}
          </AlertDescription>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void dispatch(fetchDeities())}
          >
            Try Again
          </Button>
        </Alert>
      )}

      <SevaForm
        key={seva.id}
        initialValues={seva}
        temples={temples}
        templesLoading={templesLoading}
        loading={saving || loading}
        deities={deities}
        deitiesLoading={deitiesLoading}
        selectedTempleId={selectedTempleId}
        onTempleChange={handleTempleChange}
        onSubmit={async (data) => {
          try {
            await dispatch(
              updateSeva({
                id: seva.id,
                payload: {
                  ...data,
                  deity_id: data.deity_id ?? null,
                },
              }),
            ).unwrap();

            showCmtToast(
              "success",
              "Seva updated successfully.",
            );

            navigate("/sevas");
          } catch (err: unknown) {
            showCmtToast(
              "expiry",
              typeof err === "string"
                ? err
                : err instanceof Error
                  ? err.message
                  : "Failed to update Seva.",
            );
          }
        }}
        onCancel={() => navigate("/sevas")}
      />
    </div>
  );
}

