


import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";

import type { AppDispatch } from "@/app/store";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import TokenForm from "../components/TokenForm";
import {
  fetchTokenById,
  updateToken,
} from "../tokenThunks";
import {
  selectSelectedToken,
  selectTokensLoading,
  selectTokensSaving,
  selectTokensError,
} from "../tokenSelectors";

import { fetchTemples } from "../../temple/templeThunks";
import {
  selectTemples,
  selectTempleLoading,
  selectTempleError,
} from "../../temple/templeSelectors";

import { fetchSevas } from "../../seva/sevaThunks";
import {
  selectSevas,
  selectSevaLoading,
  selectSevaError,
} from "../../seva/sevaSelectors";

import { fetchDeities } from "../../deities/deityThunks";
import {
  selectDeities,
  selectDeitiesLoading,
  selectDeitiesError,
} from "../../deities/deitySelectors";

export default function EditToken() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const token = useSelector(selectSelectedToken);
  const loading = useSelector(selectTokensLoading);
  const saving = useSelector(selectTokensSaving);
  const tokenError = useSelector(selectTokensError);

  const temples = useSelector(selectTemples);
  const templesLoading = useSelector(selectTempleLoading);
  const templesError = useSelector(selectTempleError);

  const allSevas = useSelector(selectSevas);
  const sevasLoading = useSelector(selectSevaLoading);
  const sevasError = useSelector(selectSevaError);

  const allDeities = useSelector(selectDeities);
  const deitiesLoading = useSelector(selectDeitiesLoading);
  const deitiesError = useSelector(selectDeitiesError);

  // const [submitError, setSubmitError] = useState("");
  // const [selectedTempleId, setSelectedTempleId] = useState(0);

  // const handleTempleChange = useCallback((templeId: number) => {
  //   setSelectedTempleId(templeId);
  // }, []);

  const [submitError, setSubmitError] = useState("");
const [manuallySelectedTempleId, setManuallySelectedTempleId] =
  useState<number | null>(null);

const selectedTempleId =
  manuallySelectedTempleId ?? token?.temple_id ?? 0;

const handleTempleChange = useCallback((templeId: number) => {
  setManuallySelectedTempleId(templeId);
}, []);

  useEffect(() => {
    const tokenId = Number(id);

    if (!id || !Number.isSafeInteger(tokenId) || tokenId <= 0) {
      navigate("/tokens", { replace: true });
      return;
    }

    void dispatch(fetchTokenById(tokenId));
    void dispatch(fetchTemples());
    void dispatch(fetchDeities());
  }, [dispatch, id, navigate]);

  // Initialize the selected temple from the loaded token.
  // useEffect(() => {
  //   if (token?.temple_id) {
  //     setSelectedTempleId(token.temple_id);
  //   }
  // }, [token?.id, token?.temple_id]);

  // Fetch Sevas whenever the selected temple changes.
  useEffect(() => {
    if (!selectedTempleId) {
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

  if (loading && !token) {
    return <p className="p-4">Loading Token...</p>;
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to Load Token</AlertTitle>
          <AlertDescription>
            {tokenError || "Token not found."}
          </AlertDescription>
        </Alert>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/tokens")}
        >
          Back to Tokens
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Token</h1>
        <p className="text-sm text-muted-foreground">
          Update token details and settings.
        </p>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to Update Token</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setSubmitError("")}
          >
            Dismiss
          </Button>
        </Alert>
      )}

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

      {sevasError && selectedTempleId > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to Load Sevas</AlertTitle>
          <AlertDescription>{sevasError}</AlertDescription>
        </Alert>
      )}

      {deitiesError && selectedTempleId > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to Load Deities</AlertTitle>
          <AlertDescription>{deitiesError}</AlertDescription>
        </Alert>
      )}

      <TokenForm
        key={token.id}
        initialValues={token}
        temples={temples}
        templesLoading={templesLoading}
        sevas={sevas}
        deities={deities}
        sevasLoading={sevasLoading}
        deitiesLoading={deitiesLoading}
        selectedTempleId={selectedTempleId}
        onTempleChange={handleTempleChange}
        loading={saving || loading}
        onSubmit={async (data) => {
          setSubmitError("");

          try {
            await dispatch(
              updateToken({
                id: token.id,
                payload: data,
              }),
            ).unwrap();

            navigate("/tokens");
          } catch (err: unknown) {
            setSubmitError(
              typeof err === "string"
                ? err
                : err instanceof Error
                  ? err.message
                  : "Failed to update Token.",
            );
          }
        }}
        onCancel={() => navigate("/tokens")}
      />
    </div>
  );
}
