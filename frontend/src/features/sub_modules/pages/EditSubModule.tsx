
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AppDispatch } from "@/app/store";

import SubmodulesForm from "../components/SubmoduleForm";
import { showCmtToast } from "@/components/ui/cmt-toast";

import {
  fetchSubModuleById,
  editSubModule,
} from "../submoduleThunks";

import {
  selectSubModulesLoading,
} from "../submoduleSelectors";

import type {
  SubModuleFormData,
} from "../submoduleValidations";

import type {
  SubModule,
} from "../submoduleTypes";

import {
  fetchModulesList,
} from "../../modules/moduleThunks";

import {
  fetchRoles,
} from "../../roles/roleThunks";

import {
  selectRoles,
  selectRolesLoading,
  selectRolesError,
} from "../../roles/roleSelectors";

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
      error?: string;
      response?: {
        data?: {
          message?: string;
          error?: string;
          errors?: Record<string, string>;
        };
      };
    };

    const responseData = err.response?.data;

    const validationMessage = responseData?.errors
      ? Object.values(responseData.errors).find(
          (message) => typeof message === "string" && message.trim(),
        )
      : undefined;

    return (
      responseData?.message ??
      responseData?.error ??
      validationMessage ??
      err.message ??
      err.error ??
      "Something went wrong. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
}

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function EditSubModule() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [error, setError] = useState("");
  const [submodule, setSubModule] = useState<SubModule | null>(null);
  const [pageLoading, setPageLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);

  const loading = useSelector(selectSubModulesLoading);

  const roles = useSelector(selectRoles);
  const rolesLoading = useSelector(selectRolesLoading);
  const rolesError = useSelector(selectRolesError);

  /* ------------------------------------------------------------------------ */
  /* LOAD EDIT DATA                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;

    const loadData = async () => {
      setPageLoading(true);
      setError("");
      setSubModule(null);

      try {
        const [, , result] = await Promise.all([
          dispatch(fetchModulesList()),
          dispatch(fetchRoles()),
          dispatch(fetchSubModuleById(id)),
        ]);

        if (!mounted) {
          return;
        }

        if (fetchSubModuleById.fulfilled.match(result)) {
          setSubModule(result.payload);
        } else {
          setError(
            getErrorMessage(
              result.payload ?? result.error,
            ),
          );
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (mounted) {
          setPageLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [dispatch, id]);

  /* ------------------------------------------------------------------------ */
  /* SUBMIT                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (data: SubModuleFormData) => {
    setError("");

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      setError("Invalid submodule ID. Please try again.");
      return;
    }

    if (submitting) {
      return;
    }

    if (rolesLoading) {
      setError("Roles are loading. Please try again.");
      return;
    }

    if (rolesError) {
      setError(getErrorMessage(rolesError));
      return;
    }

    if (roles.length === 0) {
      setError("No roles are available. Please configure roles first.");
      return;
    }

    const permissions = roles.map((role) => {
      const existing = data.permissions?.find(
        (permission) =>
          Number(permission.role_id) === Number(role.id),
      );

      return {
        role_id: Number(role.id),
        permission: Number(existing?.permission ?? 0),
      };
    });

    const payload = {
      id: Number(id),
      module_id: Number(data.module_id),
      sub_module_name: data.sub_module_name.trim(),
      sub_module_status: data.sub_module_status,
      display_order: Number(data.display_order),
      note: data.note?.trim() ?? "",
      permissions,
    };

    setSubmitting(true);

    try {
      await dispatch(editSubModule(payload)).unwrap();
      showCmtToast("success", "Sub module updated successfully.");

      navigate("/submodules", {
        state: {
          successMessage: "Submodule updated successfully.",
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
          Invalid submodule ID.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/submodules")}
        >
          Back to Submodules
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
          Loading submodule...
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR / NOT FOUND                                                        */
  /* ------------------------------------------------------------------------ */

  if (!submodule) {
    return (
      <div className="space-y-4 rounded-md border p-6">
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />

          <AlertTitle>
            Unable to load submodule
          </AlertTitle>

          <AlertDescription>
            {error || "The requested submodule could not be found."}
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/submodules")}
          >
            Back to Submodules
          </Button>

          <Button
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
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
            Unable to update submodule
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

      {!rolesLoading && rolesError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />

          <AlertTitle>
            Unable to load roles
          </AlertTitle>

          <AlertDescription>
            {getErrorMessage(rolesError)}
          </AlertDescription>
        </Alert>
      )}

      <SubmodulesForm
        initialData={{
          id: Number(submodule.id),
          module_id: Number(submodule.module_id),
          sub_module_name: submodule.sub_module_name ?? "",
          sub_module_status: submodule.sub_module_status ?? "active",
          display_order: Number(submodule.display_order ?? 1),
          note: submodule.note ?? "",
          permissions: submodule.permissions ?? [],
        }}
        loading={loading || rolesLoading || submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/submodules")}
      />
    </div>
  );
}

