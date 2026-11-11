


import { useEffect, useState } from "react";
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

import ModulesForm from "../components/ModulesForm";

import {
  fetchModuleById,
  editModule,
} from "../moduleThunks";

import { selectModulesLoading } from "../modulesSelectors";

import type { ModuleFormData } from "../moduleValidation";
import type { Module } from "../moduleTypes";
import { showCmtToast } from "@/components/ui/cmt-toast";

/* -------------------------------------------------------------------------- */
/* ERROR HANDLER                                                              */
/* -------------------------------------------------------------------------- */

function getErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const err = error as {
      message?: string;
      response?: {
        data?: {
          message?: string;
          error?: string;
          errors?: Record<string, string>;
        };
      };
    };

    const data = err.response?.data;

    const validationMessage = data?.errors
      ? Object.values(data.errors).find(
          (message) => typeof message === "string" && message.trim(),
        )
      : undefined;

    return (
      data?.message ??
      data?.error ??
      validationMessage ??
      err.message ??
      "Unable to update the module. Please try again."
    );
  }

  return "Unable to update the module. Please try again.";
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function EditModule() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector(selectModulesLoading);

  const [module, setModule] = useState<Module | null>(null);
  const [pageLoading, setPageLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* LOAD MODULE                                                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const loadModule = async () => {
      try {
        const result = await dispatch(fetchModuleById(id)).unwrap();

        if (!cancelled) {
          setModule(result);
          setError("");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setModule(null);
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    };

    void loadModule();

    return () => {
      cancelled = true;
    };
  }, [dispatch, id]);

  /* ------------------------------------------------------------------------ */
  /* SUBMIT                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (data: ModuleFormData) => {
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      setError("Invalid module ID. Please try again.");
      return;
    }

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await dispatch(
        editModule({
          ...data,
          id: Number(id),
        }),
      ).unwrap();

      showCmtToast("success", "Module updated successfully.");
      navigate("/modules", {
        state: {
          successMessage: "Module updated successfully.",
        },
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* INVALID ID                                                               */
  /* ------------------------------------------------------------------------ */

  if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm text-destructive">
          Invalid module ID.
        </p>

        <Button
          type="button"
          variant="link"
          className="mt-4"
          onClick={() => navigate("/modules")}
        >
          Back to Modules
        </Button>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* LOADING                                                                  */
  /* ------------------------------------------------------------------------ */

  if (pageLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading module...
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* MODULE NOT FOUND                                                         */
  /* ------------------------------------------------------------------------ */

  if (!module) {
    return (
      <div className="space-y-4 rounded-md border p-6">
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />

          <AlertTitle>
            Unable to load module
          </AlertTitle>

          <AlertDescription>
            {error || "Module not found."}
          </AlertDescription>
        </Alert>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/modules")}
        >
          Back to Modules
        </Button>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* FORM                                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />

          <AlertTitle>
            Unable to update module
          </AlertTitle>

          <AlertDescription>
            <div className="space-y-3">
              <p>{error}</p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setError("")}
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <ModulesForm
        initialData={module}
        loading={loading || submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/modules")}
      />
    </div>
  );
}
