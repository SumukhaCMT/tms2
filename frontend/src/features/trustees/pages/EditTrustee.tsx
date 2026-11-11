
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { showCmtToast } from "@/components/ui/cmt-toast";
import type { AppDispatch } from "@/app/store";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import TrusteeForm from "../components/TrusteeForm";
import {
  fetchTrusteeById,
  updateTrustee,
} from "../trusteeThunks";
import {
  selectSelectedTrustee,
  selectTrusteeDetailLoading,
  selectTrusteeSaving,
  selectTrusteesError,
} from "../trusteeSelectors";

import { fetchTemples } from "@/features/temple/templeThunks";
import {
  selectTemples,
  selectTempleLoading,
} from "@/features/temple/templeSelectors";

export default function EditTrustee() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const trustee = useSelector(selectSelectedTrustee);
  const detailLoading = useSelector(selectTrusteeDetailLoading);
  const saving = useSelector(selectTrusteeSaving);
  const error = useSelector(selectTrusteesError);

  const temples = useSelector(selectTemples);
  const templesLoading = useSelector(selectTempleLoading);

  
  useEffect(() => {
    const trusteeId = Number(id);

    if (
      !id ||
      !Number.isSafeInteger(trusteeId) ||
      trusteeId <= 0
    ) {
      navigate("/trustees", { replace: true });
      return;
    }

    void dispatch(fetchTrusteeById(trusteeId));
    void dispatch(fetchTemples());
  }, [dispatch, id, navigate]);

  if (detailLoading && !trustee) {
    return <p className="p-4">Loading trustee...</p>;
  }

  if (!trustee) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to Load Trustee</AlertTitle>
        <AlertDescription>
          {error || "Trustee not found."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Trustee</h1>
        <p className="text-sm text-muted-foreground">
          Update trustee contact details and settings.
        </p>
      </div>

      <TrusteeForm
        key={trustee.id}
        initialValues={trustee}
        temples={temples}
        templesLoading={templesLoading}
        loading={saving || detailLoading}
        onSubmit={async (data) => {
          try {
            await dispatch(
              updateTrustee({
                id: trustee.id,
                payload: data,
              }),
            ).unwrap();
            showCmtToast("success", "Trustee updated successfully.");
            navigate("/trustees");
          } catch (err: unknown) {
            showCmtToast(
              "expiry",
              typeof err === "string"
                ? err
                : err instanceof Error
                  ? err.message
                  : "Failed to update trustee.",
            );
          }
        }}
        onCancel={() => navigate("/trustees")}
      />
    </div>
  );
}
