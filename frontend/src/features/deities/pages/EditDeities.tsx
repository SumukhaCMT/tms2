
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { showCmtToast } from "@/components/ui/cmt-toast";
import { useImageUrl } from "@/hooks/useImageUrl";
import { persistEntityImage, type ImageSelection } from "@/utils/imageUpload";
import type { AppDispatch, RootState } from "@/app/store";
import { Alert, AlertDescription, AlertTitle,} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import DeitiesForm from "../components/DeitiesForm";
import {selectDeitiesError, selectDeitiesLoading, selectDeitiesSaving, selectSelectedDeity,} from "../deitySelectors";
import { clearSelectedDeity } from "../deitySlice";
import { fetchDeityById, updateDeity,} from "../deityThunks";
import type { CreateDeityPayload } from "../deityTypes";
import { fetchTemples } from "../../temple/templeThunks";
import { selectTemples, selectTempleLoading, selectTempleError,} from "../../temple/templeSelectors";
export default function EditDeities() {
  const { id } = useParams<{ id: string }>();
  const deityId = Number(id);
  const validId =  Number.isSafeInteger(deityId) && deityId > 0;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const deity = useSelector((state: RootState) =>
    selectSelectedDeity(state)
  );
  const loading = useSelector((state: RootState) =>
    selectDeitiesLoading(state)
  );

  const saving = useSelector((state: RootState) =>
    selectDeitiesSaving(state)
  );

  const error = useSelector((state: RootState) =>
    selectDeitiesError(state)
  );

 
  const temples = useSelector((state: RootState) =>
    selectTemples(state)
  );

  const templesLoading = useSelector((state: RootState) =>
    selectTempleLoading(state)
  );

  const templesError = useSelector((state: RootState) =>
    selectTempleError(state)
  );

  const currentImageUrl = useImageUrl(
    deity?.id === deityId && deity.deity_img_name ? `/v1/deities/${deityId}/image` : null
  );

  // Fetch deity details and clear selection on unmount
  useEffect(() => {
    if (!validId) {
      navigate("/deities", { replace: true });
      return;
    }

    void dispatch(fetchDeityById(deityId));

    return () => {
      dispatch(clearSelectedDeity());
    };
  }, [dispatch, deityId, validId, navigate]);

  // Fetch temples for the temple dropdown
  useEffect(() => {
    void dispatch(fetchTemples());
  }, [dispatch]);

  // Update deity
  const handleSubmit = async (data: CreateDeityPayload, image: ImageSelection) => {
    if (!validId) {
      navigate("/deities", { replace: true });
      return;
    }

    try {
      await dispatch(
        updateDeity({
          id: deityId,
          data,
        })
      ).unwrap();

      await persistEntityImage(`/v1/deities/${deityId}/image`, image, "Deity");
      showCmtToast("success", "Deity updated successfully.");
      navigate("/deities");
    } catch (err: unknown) {
      showCmtToast(
        "expiry",
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Failed to update deity."
      );
    }
  };

  // Invalid ID
  if (!validId) {
    return (
      <p className="text-destructive">
        Invalid deity ID.
      </p>
    );
  }

  // Loading deity details
  if (loading && (!deity || deity.id !== deityId)) {
    return (
      <p>Loading deity...</p>
    );
  }

  // Failed to fetch deity details
  if (error && (!deity || deity.id !== deityId)) {
    return (
      <div className="space-y-3">
        <p className="text-destructive">
          {error}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void dispatch(fetchDeityById(deityId));
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Deity not found
  if (!deity || deity.id !== deityId) {
    return (
      <p>Deity not found.</p>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-semibold">
          Edit Deity
        </h1>

        <p className="text-sm text-muted-foreground">
          Update the deity details and temple settings.
        </p>
      </div>

      {/* Temple loading error */}
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
            className="mt-3"
            onClick={() => {
              void dispatch(fetchTemples());
            }}
          >
            Try Again
          </Button>
        </Alert>
      )}

    

      {/* Deity form */}
      <DeitiesForm
        key={deity.id}
        initialData={deity}
        currentImageUrl={currentImageUrl}
        temples={temples ?? []}
        templesLoading={templesLoading}
        loading={saving}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/deities")}
      />
    </div>
  );
}

