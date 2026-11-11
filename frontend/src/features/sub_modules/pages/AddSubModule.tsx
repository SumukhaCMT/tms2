


"use client";

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

import SubModulesForm from "../components/SubmoduleForm";
import { addSubModule } from "../submoduleThunks";
import { fetchModulesList } from "../../modules/moduleThunks";
import { fetchRoles } from "../../roles/roleThunks";

import { selectSubModulesLoading } from "../submoduleSelectors";
import {
  selectRoles,
  selectRolesLoading,
  selectRolesError,
} from "../../roles/roleSelectors";

import type { SubModuleFormData } from "../submoduleValidations";
import { showCmtToast } from "@/components/ui/cmt-toast";

export default function AddSubModule() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector(selectSubModulesLoading);
  const roles = useSelector(selectRoles);
  const rolesLoading = useSelector(selectRolesLoading);
  const rolesError = useSelector(selectRolesError);

  const [error, setError] = useState("");

  useEffect(() => {
    void dispatch(fetchModulesList());
    void dispatch(fetchRoles());
  }, [dispatch]);

  const handleSubmit = async (data: SubModuleFormData) => {
    setError("");

    if (rolesLoading) {
      setError("Roles are still loading. Please try again.");
      return;
    }

    if (rolesError) {
      setError(`Unable to load roles: ${rolesError}`);
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

    const payload: SubModuleFormData = {
      ...data,
      sub_module_name: data.sub_module_name.trim(),
      permissions,
    };

    try {
      await dispatch(addSubModule(payload)).unwrap();
      showCmtToast("success", "Sub module created successfully.");
      navigate("/submodules");
    } catch (err: unknown) {
      setError(
        typeof err === "string"
          ? err
          : "Unable to create the submodule. Please try again.",
      );
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to Create Submodule</AlertTitle>
          <AlertDescription>{error}</AlertDescription>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setError("")}
          >
            Dismiss
          </Button>
        </Alert>
      )}

      <SubModulesForm
        onSubmit={handleSubmit}
        loading={loading || rolesLoading}
        onCancel={() => navigate("/submodules")}
      />
    </div>
  );
}
