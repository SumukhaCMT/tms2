
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"

import type { AppDispatch } from "@/app/store"

import SubModulesForm from "../components/SubmoduleForm"
import { addSubModule } from "../submoduleThunks"
import { fetchModulesList } from "../../modules/moduleThunks"

import {
  selectSubModulesLoading,
} from "../submoduleSelectors"

import type {
  SubModuleFormData,
} from "../submoduleValidations"

export default function AddSubModule() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const loading = useSelector(selectSubModulesLoading)

  useEffect(() => {
    dispatch(fetchModulesList())
  }, [dispatch])

  const handleSubmit = async (
    data: SubModuleFormData
  ) => {
   
    const result=  await dispatch(
        addSubModule(data)
      )

     
       if (addSubModule.fulfilled.match(result)) {
             navigate("/submodule")
          }
  
  }

  return (
    <div className="w-full">
      <SubModulesForm
        onSubmit={handleSubmit}
        loading={loading}
        onCancel={() => navigate("/submodule")}
      />
    </div>
  )
}