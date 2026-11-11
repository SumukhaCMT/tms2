
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { showCmtToast } from "@/components/ui/cmt-toast";
import type { AppDispatch } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import TrusteeForm from "../components/TrusteeForm";
import { createTrustee } from "../trusteeThunks";
import { selectTrusteeSaving } from "../trusteeSelectors";

import { fetchTemples } from "@/features/temple/templeThunks";
import {
  selectTemples,
  selectTempleLoading,
  selectTempleError,
} from "@/features/temple/templeSelectors";

export default function AddTrustee() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const temples = useSelector(selectTemples);
  const templesLoading = useSelector(selectTempleLoading);
  const templesError = useSelector(selectTempleError);
  const saving = useSelector(selectTrusteeSaving);

  useEffect(() => {
    void dispatch(fetchTemples());
  }, [dispatch]);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Trustee</h1>
        <p className="text-sm text-muted-foreground">
          Add a trustee and configure their contact details.
        </p>
      </div>

      {templesError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to Load Temples</AlertTitle>
          <AlertDescription>{templesError}</AlertDescription>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 cursor-pointer"
            onClick={() => void dispatch(fetchTemples())}
          >
            Try Again
          </Button>
        </Alert>
      )}

      <TrusteeForm
        temples={temples}
        templesLoading={templesLoading}
        loading={saving}
        onSubmit={async (data) => {
          try {
            await dispatch(createTrustee(data)).unwrap();
            showCmtToast("success", "Trustee created successfully.");
            navigate("/trustees");
          } catch (err: unknown) {
            showCmtToast(
              "expiry",
              typeof err === "string"
                ? err
                : err instanceof Error
                  ? err.message
                  : "Failed to create trustee.",
            );
          }
        }}
        onCancel={() => navigate("/trustees")}
      />
    </div>
  );
}
