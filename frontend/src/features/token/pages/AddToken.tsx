

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

import type { AppDispatch } from "@/app/store";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import TokenForm from "../components/TokenForm";
import { createToken } from "../tokenThunks";
import { selectTokensSaving } from "../tokenSelectors";

import { fetchTemples } from "../../temple/templeThunks";
import {
  selectTemples,
  selectTempleLoading,
  selectTempleError,
} from "../../temple/templeSelectors";

import { fetchDeities } from "../../deities/deityThunks";
import {
  selectDeities,
  selectDeitiesLoading,
  selectDeitiesError,
} from "../../deities/deitySelectors";

import { fetchSevas } from "../../seva/sevaThunks";
import {
  selectSevas,
  selectSevaLoading,
  selectSevaError,
} from "../../seva/sevaSelectors";

export default function AddToken() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [selectedTempleId, setSelectedTempleId] = useState(0);

  const temples = useSelector(selectTemples);
  const templesLoading = useSelector(selectTempleLoading);
  const templesError = useSelector(selectTempleError);

  const saving = useSelector(selectTokensSaving);

  const allSevas = useSelector(selectSevas);
  const sevasLoading = useSelector(selectSevaLoading);
  const sevasError = useSelector(selectSevaError);

  const allDeities = useSelector(selectDeities);
  const deitiesLoading = useSelector(selectDeitiesLoading);
  const deitiesError = useSelector(selectDeitiesError);

  useEffect(() => {
    void dispatch(fetchTemples());
    void dispatch(fetchDeities());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTempleId <= 0) {
      return;
    }

    void dispatch(
      fetchSevas({
        page: 1,
        limit: 100,
        temple_id: selectedTempleId,
      }),
    );
  }, [dispatch, selectedTempleId]);

  const sevas = allSevas.filter(
    (seva) => seva.temple_id === selectedTempleId,
  );

  const deities = allDeities.filter(
    (deity) => deity.temple_id === selectedTempleId,
  );

  const retryLoading = () => {
    setError("");

    if (templesError) {
      void dispatch(fetchTemples());
    }

    if (deitiesError) {
      void dispatch(fetchDeities());
    }

    if (sevasError && selectedTempleId > 0) {
      void dispatch(
        fetchSevas({
          page: 1,
          limit: 100,
          temple_id: selectedTempleId,
        }),
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Token</h1>

        <p className="text-sm text-muted-foreground">
          Configure a token and its temple, seva, and deity associations.
        </p>
      </div>

      {(error || templesError || sevasError || deitiesError) && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />

          <AlertTitle>
            Unable to Load or Save Token
          </AlertTitle>

          <AlertDescription>
            {error || templesError || sevasError || deitiesError}
          </AlertDescription>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={retryLoading}
          >
            Try Again
          </Button>
        </Alert>
      )}

      <TokenForm
        temples={temples}
        templesLoading={templesLoading}
        sevas={sevas}
        deities={deities}
        sevasLoading={sevasLoading}
        deitiesLoading={deitiesLoading}
        selectedTempleId={selectedTempleId}
        onTempleChange={setSelectedTempleId}
        loading={saving}
        onSubmit={async (data) => {
          setError("");

          try {
            await dispatch(createToken(data)).unwrap();
            navigate("/tokens");
          } catch (err: unknown) {
            setError(
              typeof err === "string"
                ? err
                : err instanceof Error
                  ? err.message
                  : "Failed to create token.",
            );
          }
        }}
        onCancel={() => navigate("/tokens")}
      />
    </div>
  );
}