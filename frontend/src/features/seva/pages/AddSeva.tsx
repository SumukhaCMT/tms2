
// // import { useEffect } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { useNavigate } from "react-router-dom";
// // import { AlertCircle } from "lucide-react";

// // import { showCmtToast } from "@/components/ui/cmt-toast";
// // import type { AppDispatch } from "@/app/store";

// // import {
// //   Alert,
// //   AlertDescription,
// //   AlertTitle,
// // } from "@/components/ui/alert";
// // import { Button } from "@/components/ui/button";

// // import SevaForm from "../components/SevaForm";
// // import { createSeva } from "../sevaThunks";

// // import { fetchTemples } from "../../temple/templeThunks";
// // import {
// //   selectTemples,
// //   selectTempleLoading,
// //   selectTempleError,
// // } from "../../temple/templeSelectors";

// // import {
// //   selectSevaSaving,
// // } from "../sevaSelectors";

// // export default function AddSeva() {
// //   const dispatch = useDispatch<AppDispatch>();
// //   const navigate = useNavigate();

  
// //   const temples = useSelector(selectTemples);
// //   const templesLoading = useSelector(selectTempleLoading);
// //   const templesError = useSelector(selectTempleError);
// //   const saving = useSelector(selectSevaSaving);

// //   useEffect(() => {
// //     void dispatch(fetchTemples());
// //   }, [dispatch]);

// //   return (
// //     <div className="w-full space-y-6">
// //       <div>
// //         <h1 className="text-2xl font-semibold">Add Seva</h1>
// //         <p className="text-sm text-muted-foreground">
// //           Configure a Seva and its amount for a temple.
// //         </p>
// //       </div>

// //       {templesError && (
// //         <Alert variant="destructive">
// //           <AlertCircle className="size-4" />
// //           <AlertTitle>Unable to Load Temples</AlertTitle>
// //           <AlertDescription>{templesError}</AlertDescription>
// //           <Button
// //             type="button"
// //             variant="outline"
// //             size="sm"
// //             onClick={() => void dispatch(fetchTemples())}
// //           >
// //             Try Again
// //           </Button>
// //         </Alert>
// //       )}

// //       <SevaForm
// //         temples={temples}
// //         templesLoading={templesLoading}
// //         loading={saving}
// //         onSubmit={async (data) => {
// //           try {
// //             await dispatch(createSeva(data)).unwrap();
// //             showCmtToast("success", "Seva created successfully.");
// //             navigate("/sevas");
// //           } catch (err: unknown) {
// //             showCmtToast(
// //               "expiry",
// //               typeof err === "string"
// //                 ? err
// //                 : err instanceof Error
// //                   ? err.message
// //                   : "Failed to create Seva.",
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
// import { useNavigate } from "react-router-dom";

// import { AlertCircle } from "lucide-react";

// import type { AppDispatch } from "@/app/store";
// import { useAuth } from "@/features/auth/useAuth";

// import { showCmtToast } from "@/components/ui/cmt-toast";

// import {
//   Alert,
//   AlertDescription,
//   AlertTitle,
// } from "@/components/ui/alert";

// import { Button } from "@/components/ui/button";

// import SevaForm from "../components/SevaForm";

// import { createSeva } from "../sevaThunks";

// import {
//   selectSevaSaving,
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

// export default function AddSeva() {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const { user } = useAuth();

//   // Temple state
//   const temples = useSelector(selectTemples);
//   const templesLoading = useSelector(selectTempleLoading);
//   const templesError = useSelector(selectTempleError);

//   // Deity state
//   const allDeities = useSelector(selectDeities);
//   const deitiesLoading = useSelector(selectDeitiesLoading);
//   const deitiesError = useSelector(selectDeitiesError);

//   // Seva state
//   const saving = useSelector(selectSevaSaving);

//   const isOrgAdmin =
//     !!user?.organization_id && !user?.temple_id;

//   const [selectedTempleId, setSelectedTempleId] =
//     useState<number>(Number(user?.temple_id ?? 0));

//   // Load temples and deities.
//   useEffect(() => {
//     void dispatch(fetchTemples());
//     void dispatch(fetchDeities());
//   }, [dispatch]);

//   // Set temple automatically for temple-level users.
//   useEffect(() => {
//     if (!isOrgAdmin && user?.temple_id) {
//       setSelectedTempleId(Number(user.temple_id));
//     }
//   }, [isOrgAdmin, user?.temple_id]);

//   // Handle temple selection.
//   const handleTempleChange = useCallback(
//     (templeId: number) => {
//       setSelectedTempleId(templeId);
//     },
//     [],
//   );

//   // Only show deities belonging to the selected temple.
//   const deities = allDeities.filter(
//     (deity) =>
//       Number(deity.temple_id) === selectedTempleId,
//   );

//   const handleSubmit = async (
//     data: Parameters<typeof createSeva>[0] extends never
//       ? never
//       : import("../sevaTypes").CreateSevaPayload,
//   ) => {
//     try {
//       await dispatch(
//         createSeva({
//           ...data,
//           deity_id: data.deity_id ?? null,
//         }),
//       ).unwrap();

//       showCmtToast(
//         "success",
//         "Seva created successfully.",
//       );

//       navigate("/sevas");
//     } catch (err: unknown) {
//       showCmtToast(
//         "expiry",
//         typeof err === "string"
//           ? err
//           : err instanceof Error
//             ? err.message
//             : "Failed to create Seva.",
//       );
//     }
//   };

//   return (
//     <div className="w-full space-y-6">
//       <div>
//         <h1 className="text-2xl font-semibold">
//           Add Seva
//         </h1>

//         <p className="text-sm text-muted-foreground">
//           Configure a Seva and its amount for a temple.
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
//         temples={temples}
//         templesLoading={templesLoading}
//         loading={saving}
//         deities={deities}
//         deitiesLoading={deitiesLoading}
//         selectedTempleId={selectedTempleId}
//         onTempleChange={handleTempleChange}
//         onSubmit={handleSubmit}
//         onCancel={() => navigate("/sevas")}
//       />
//     </div>
//   );
// }



import { useCallback, useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { AlertCircle } from "lucide-react";

import type { AppDispatch } from "@/app/store";
import { useAuth } from "@/features/auth/useAuth";

import { showCmtToast } from "@/components/ui/cmt-toast";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { Button } from "@/components/ui/button";

import SevaForm from "../components/SevaForm";

import { createSeva } from "../sevaThunks";

import {
  selectSevaSaving,
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

import type { CreateSevaPayload } from "../sevaTypes";

export default function AddSeva() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useAuth();

  // Temple selectors
  const temples = useSelector(selectTemples);
  const templesLoading = useSelector(selectTempleLoading);
  const templesError = useSelector(selectTempleError);

  // Deity selectors
  const allDeities = useSelector(selectDeities);
  const deitiesLoading = useSelector(selectDeitiesLoading);
  const deitiesError = useSelector(selectDeitiesError);

  // Seva selectors
  const saving = useSelector(selectSevaSaving);

  // Role check
  const isOrgAdmin =
    !!user?.organization_id && !user?.temple_id;

  // Store temple selection only for organization admins.
  const [selectedTempleIdState, setSelectedTempleIdState] =
    useState<number>(0);

  // Temple-level users automatically use their assigned temple.
  const selectedTempleId = isOrgAdmin
    ? selectedTempleIdState
    : Number(user?.temple_id ?? 0);

  // Load temples and deities.
  useEffect(() => {
    void dispatch(fetchTemples());
    void dispatch(fetchDeities());
  }, [dispatch]);

  // Handle temple selection.
  const handleTempleChange = useCallback(
    (templeId: number) => {
      setSelectedTempleIdState(templeId);
    },
    [],
  );

  // Filter deities by selected temple.
  const deities = allDeities.filter(
    (deity) =>
      Number(deity.temple_id) === selectedTempleId,
  );

  // Create seva.
  const handleSubmit = async (
    data: CreateSevaPayload,
  ) => {
    try {
      await dispatch(
        createSeva({
          ...data,
          deity_id: data.deity_id ?? null,
        }),
      ).unwrap();

      showCmtToast(
        "success",
        "Seva created successfully.",
      );

      navigate("/sevas");
    } catch (err: unknown) {
      showCmtToast(
        "expiry",
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Failed to create Seva.",
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Add Seva
        </h1>

        <p className="text-sm text-muted-foreground">
          Configure a Seva and its amount for a temple.
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
        temples={temples}
        templesLoading={templesLoading}
        loading={saving}
        deities={deities}
        deitiesLoading={deitiesLoading}
        selectedTempleId={selectedTempleId}
        onTempleChange={handleTempleChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/sevas")}
      />
    </div>
  );
}
