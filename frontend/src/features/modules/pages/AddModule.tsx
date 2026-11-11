

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { addModule } from "../moduleThunks";
import { selectModulesLoading } from "../modulesSelectors";

import type { ModuleFormData } from "../moduleValidation";
import { showCmtToast } from "@/components/ui/cmt-toast";

export default function AddModule() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loading = useSelector(selectModulesLoading);

  const [error, setError] = useState("");

  const handleSubmit = async (data: ModuleFormData) => {
    setError("");

    try {
      await dispatch(addModule(data)).unwrap();
      showCmtToast("success", "Module created successfully.");

      navigate("/modules");
    } catch (err: unknown) {
      setError(
        typeof err === "string"
          ? err
          : "Unable to create the module. Please try again.",
      );
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" />

          <AlertTitle>Unable to Create Module</AlertTitle>

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

      <ModulesForm
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/modules")}
      />
    </div>
  );
}
