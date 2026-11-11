

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle } from "lucide-react";

import type { AppDispatch } from "@/app/store";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import TempleForm from "../components/TempleForm";
import { fetchTemple, updateTemple } from "../templeThunks";

import {
  selectSelectedTemple,
  selectTempleDetailsLoading,
  selectTempleSaving,
  selectTempleDetailsError,
} from "../templeSelectors";

import type { TempleFormData } from "../templeTypes";
import { showCmtToast } from "@/components/ui/cmt-toast";
import { useImageUrl } from "@/hooks/useImageUrl";
import { persistEntityImage, type ImageSelection } from "@/utils/imageUpload";

export default function EditTemple() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const temple = useSelector(selectSelectedTemple);
  const loading = useSelector(selectTempleDetailsLoading);
  const saving = useSelector(selectTempleSaving);
  const detailsError = useSelector(selectTempleDetailsError);
  const currentImageUrl = useImageUrl(temple?.temp_img_name ? `/v1/temples/${temple.id}/image` : null);

  useEffect(() => {
    if (!id) return;

    const templeId = Number(id);

    if (!Number.isInteger(templeId) || templeId <= 0) {
      return;
    }

    void dispatch(fetchTemple(templeId));
  }, [dispatch, id]);

  const handleSubmit = async (data: TempleFormData, image: ImageSelection) => {
    if (!id) {
      showCmtToast("expiry", "Temple ID is missing.");
      return;
    }

    const templeId = Number(id);

    if (!Number.isInteger(templeId) || templeId <= 0) {
      showCmtToast("expiry", "Invalid temple ID.");
      return;
    }

   
    
try {
  const result = await dispatch(
    updateTemple({
      id: templeId,
      data,
    }),
  );

  if (updateTemple.fulfilled.match(result)) {
    if (await persistEntityImage(`/v1/temples/${templeId}/image`, image, "Temple")) {
      showCmtToast("success", "Temple updated successfully.");
    }
    navigate("/temples");
    return;
  }

  const message =
    result.payload ??
    result.error.message ??
    "Unable to update temple. Please try again.";

  showCmtToast("expiry", message);
} catch {
  showCmtToast("expiry", "An unexpected error occurred while updating the temple.");
}

  };

  if (loading) {
    return <div className="p-6">Loading temple...</div>;
  }

  if (detailsError) {
    return (
      <div className="p-6 space-y-4">
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to load temple</AlertTitle>
          <AlertDescription>{detailsError}</AlertDescription>
        </Alert>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/temples")}
        >
          Back to Temples
        </Button>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="p-6 space-y-4">
        <p>Temple not found.</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/temples")}
        >
          Back to Temples
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Temple</h1>
        <p className="text-sm text-muted-foreground">
          Update temple information.
        </p>
      </div>

      <TempleForm
        key={temple.id}
        currentImageUrl={currentImageUrl}
        initialData={{
          temp_name: temple.temp_name ?? "",
          temp_img_name: temple.temp_img_name ?? "",
          temp_legal_name: temple.temp_legal_name ?? "",
          temp_registration_number:
            temple.temp_registration_number ?? "",
          temp_gst_number: temple.temp_gst_number ?? "",
          temp_email: temple.temp_email ?? "",
          temp_phone: temple.temp_phone ?? "",
          temp_address_line1: temple.temp_address_line1 ?? "",
          temp_address_line2: temple.temp_address_line2 ?? "",
          temp_city: temple.temp_city ?? "",
          temp_state: temple.temp_state ?? "",
          temp_country: temple.temp_country ?? "India",
          temp_pincode: temple.temp_pincode ?? "",
          temp_lat: temple.temp_lat ?? null,
          temp_lng: temple.temp_lng ?? null,
          temp_is_primary: Boolean(temple.temp_is_primary),
          temp_status: temple.temp_status ?? "active",
          temp_timezone: temple.temp_timezone ?? "Asia/Kolkata",
        }}
        loading={saving}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/temples")}
      />
    </div>
  );
}