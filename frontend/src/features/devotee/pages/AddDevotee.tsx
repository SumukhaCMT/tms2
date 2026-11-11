
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AddDevotee() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Devotee</h1>
        <p className="text-sm text-muted-foreground">
          Create a new devotee record.
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          The Add Devotee form is ready to be connected once the backend
          create endpoint is implemented.
        </p>
        <p className="mt-2 text-sm font-medium">
          Required backend endpoint: POST /api/v1/devotees
        </p>

        <Button
          className="mt-5"
          variant="outline"
          onClick={() => navigate("/devotees")}
        >
          Back to Devotees
        </Button>
      </div>
    </div>
  );
}
