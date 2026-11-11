
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import type { AppDispatch, RootState } from "@/app/store";
import { fetchTemples } from "../../temple/templeThunks";
import { selectTemples } from "../../temple/templeSelectors";
import {
  selectSelectedDevotee,
  selectDevoteesLoading,
  selectDevoteesSubmitting,
} from "../devoteeSelectors";
import {
  fetchDevoteeById,
  updateDevotee,
} from "../devoteeThunks";
import { clearSelectedDevotee } from "../devoteeSlice";
import DevoteeForm from "../components/DevoteeForm";
import type { DevoteeFormData } from "../devoteeValidation";
import { showCmtToast } from "@/components/ui/cmt-toast";

export default function EditDevotee() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const devotee = useSelector((state: RootState) =>
    selectSelectedDevotee(state),
  );
  const loading = useSelector((state: RootState) =>
    selectDevoteesLoading(state),
  );
  const submitting = useSelector((state: RootState) =>
    selectDevoteesSubmitting(state),
  );
  const temples = useSelector((state: RootState) => selectTemples(state));

  useEffect(() => {
    if (id && Number.isSafeInteger(Number(id)) && Number(id) > 0) {
      void dispatch(fetchDevoteeById(Number(id)));
    }

    void dispatch(fetchTemples());

    return () => {
      dispatch(clearSelectedDevotee());
    };
  }, [dispatch, id]);

  async function handleSubmit(data: DevoteeFormData) {
    if (!id) return;

    try {
      await dispatch(
        updateDevotee({ id: Number(id), data }),
      ).unwrap();

      showCmtToast("success", "Devotee updated successfully.");
      navigate("/devotees");
    } catch (error) {
      showCmtToast(
        "expiry",
        typeof error === "string" ? error : "Failed to update devotee.",
      );
    }
  }

  if (loading && !devotee) {
    return <div className="p-8 text-center text-muted-foreground">Loading devotee...</div>;
  }

  if (!devotee) {
    return <div className="p-8 text-center text-muted-foreground">Devotee not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Devotee</h1>
        <p className="text-sm text-muted-foreground">
          Update devotee personal, devotional, and address details.
        </p>
      </div>

      <DevoteeForm
        initialData={devotee}
        temples={temples}
        loading={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/devotees")}
      />
    </div>
  );
}
