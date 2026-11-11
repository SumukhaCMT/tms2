
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import type { AppDispatch, RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { fetchDevoteeById } from "../devoteeThunks";
import { clearSelectedDevotee } from "../devoteeSlice";
import {
  selectSelectedDevotee,
  selectDevoteesLoading,
} from "../devoteeSelectors";

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export default function ViewDevotee() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const devotee = useSelector((state: RootState) =>
    selectSelectedDevotee(state),
  );
  const loading = useSelector((state: RootState) =>
    selectDevoteesLoading(state),
  );

  useEffect(() => {
    if (id && Number.isSafeInteger(Number(id)) && Number(id) > 0) {
      void dispatch(fetchDevoteeById(Number(id)));
    }

    return () => {
      dispatch(clearSelectedDevotee());
    };
  }, [dispatch, id]);

  if (loading && !devotee) {
    return <div className="p-8 text-center text-muted-foreground">Loading devotee...</div>;
  }

  if (!devotee) {
    return <div className="p-8 text-center text-muted-foreground">Devotee not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {devotee.devotee_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Devotee details and contact information
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/devotees")}>
            Back
          </Button>
          <Button onClick={() => navigate(`/devotees/edit/${devotee.id}`)}>
            Edit Devotee
          </Button>
        </div>
      </div>

      <div className="rounded-lg border p-5">
        <h2 className="mb-5 font-semibold">Basic Details</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Name" value={devotee.devotee_name} />
          <Detail label="Email" value={devotee.devotee_email} />
          <Detail label="Phone" value={devotee.devotee_phone} />
          <Detail label="Gender" value={devotee.devotee_gender} />
          <Detail label="Date of Birth" value={devotee.devotee_dob?.slice(0, 10)} />
          <Detail label="Status" value={devotee.devotee_status} />
        </div>
      </div>

      <div className="rounded-lg border p-5">
        <h2 className="mb-5 font-semibold">Devotional Details</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Gotra" value={devotee.devotee_gotra} />
          <Detail label="Rashi" value={devotee.devotee_rashi} />
          <Detail label="Nakshatra" value={devotee.devotee_nakshatra} />
          <Detail label="Remark" value={devotee.devotee_remark} />
        </div>
      </div>

      <div className="rounded-lg border p-5">
        <h2 className="mb-5 font-semibold">Address Details</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Address Line 1" value={devotee.devotee_address_line1} />
          <Detail label="Address Line 2" value={devotee.devotee_address_line2} />
          <Detail label="City" value={devotee.devotee_city} />
          <Detail label="State" value={devotee.devotee_state} />
          <Detail label="Country" value={devotee.devotee_country} />
          <Detail label="Pincode" value={devotee.devotee_pincode} />
        </div>
      </div>
    </div>
  );
}
