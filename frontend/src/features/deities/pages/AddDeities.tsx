import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { showCmtToast } from "@/components/ui/cmt-toast";
import { persistEntityImage } from "@/utils/imageUpload";
import type { AppDispatch } from "@/app/store";
import { Alert,AlertDescription, AlertTitle,} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import DeitiesForm from "../components/DeitiesForm";
import { createDeity } from "../deityThunks";
import { fetchTemples } from "../../temple/templeThunks";
import { selectTemples, selectTempleLoading, selectTempleError,} from "../../temple/templeSelectors";
export default function AddDeities() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const temples = useSelector(selectTemples);
  const templesLoading = useSelector(selectTempleLoading);
  const templesError = useSelector(selectTempleError);
  useEffect(() => {
    void dispatch(fetchTemples());
  }, [dispatch]);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Deity</h1>
        <p className="text-sm text-muted-foreground">
          Configure a deity for a temple.
        </p>
      </div>

      {templesError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>Unable to Load Temples</AlertTitle>
          <AlertDescription>{templesError}</AlertDescription>

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

      <DeitiesForm
        temples={temples}
        templesLoading={templesLoading}
        onSubmit={async (data, image) => {
          try {
            const deity = await dispatch(createDeity(data)).unwrap();
            await persistEntityImage(`/v1/deities/${deity.id}/image`, image, "Deity");
            showCmtToast("success", "Deity created successfully.");
            navigate("/deities");
          } catch (err: unknown) {
            showCmtToast(
              "expiry",
              typeof err === "string"
                ? err
                : err instanceof Error
                  ? err.message
                  : "Failed to create deity.",
            );
          }
        }}
        onCancel={() => navigate("/deities")}
      />
    </div>
  );
}