
import DevoteesTable from "../components/DevoteesTable";

export default function Devotees() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Devotees</h1>
        <p className="text-sm text-muted-foreground">
          Manage temple devotees and their personal information.
        </p>
      </div>

      <DevoteesTable />
    </div>
  );
}
