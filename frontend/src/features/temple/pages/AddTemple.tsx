

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/app/store";

import TempleForm from "../components/TempleForm";
import { createTemple } from "../templeThunks";
import { selectTempleSaving } from "../templeSelectors";
import type { TempleFormData } from "../templeTypes";
import { showCmtToast } from "@/components/ui/cmt-toast";
import { persistEntityImage, type ImageSelection } from "@/utils/imageUpload";

export default function AddTemple() {
  
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector(selectTempleSaving);

  const handleSubmit = async (data: TempleFormData, image: ImageSelection) => {
    try {
      const temple = await dispatch(createTemple(data)).unwrap();
      if (await persistEntityImage(`/v1/temples/${temple.id}/image`, image, "Temple")) {
        showCmtToast("success", "Temple created successfully.");
      }
      navigate("/temples");
    } catch (err: unknown) {
      showCmtToast("expiry", typeof err === "string" ? err : "Failed to create temple. Please try again.");
    }
  };

  return (
    <div className="w-full space-y-6">
     

      <TempleForm
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/temples")}
      />
    </div>
  );
}
