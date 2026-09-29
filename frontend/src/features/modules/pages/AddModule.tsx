


import { useNavigate } from "react-router-dom"

import { useDispatch, useSelector } from "react-redux"

import type { AppDispatch } from "@/app/store"

import ModulesForm from "../components/ModulesForm"

import { addModule } from "../moduleThunks"

import {
  selectModulesLoading,
} from "../modulesSelectors"


// import { ModuleFormData } from "../components/ModulesForm"

import type { ModuleFormData } from "../moduleValidation"
export default function AddModule() {
  const navigate = useNavigate()

  const dispatch = useDispatch<AppDispatch>()

  const loading = useSelector(
    selectModulesLoading
  )

  const handleSubmit = async (
    data: ModuleFormData
  ) => {
    const result = await dispatch(
      addModule(data)
    )

    if (addModule.fulfilled.match(result)) {
      navigate("/modules")
    }
  }

  return (
    <div className="w-full">

      <ModulesForm
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate("/modules")
        }
      />

    </div>
  )
}