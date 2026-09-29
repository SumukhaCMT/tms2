import { useEffect, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import { useDispatch, useSelector } from "react-redux"

import type { AppDispatch } from "@/app/store"

import SubmodulesForm from "../components/SubmoduleForm"


import {
  fetchSubModuleById,
  editSubModule,
} from "../submoduleThunks"
import {
  selectSubModulesLoading,
} from "../submoduleSelectors"

import type { SubModuleFormData } from "../submoduleValidations"

import type {SubModule} from "../submoduleTypes"

export default function EditSubModule(){
     const { id } = useParams<{
    id: string
     }>()
     
       const navigate = useNavigate()
     
       const dispatch = useDispatch<AppDispatch>()
     
       const loading = useSelector(
         selectSubModulesLoading
       )

         const [submodule, setSubModule] =
           useState<SubModule | null>(null)

            const [pageLoading, setPageLoading] =
            useState(true)
 useEffect(() => {
    if (!id) return

    const loadModule = async () => {
      setPageLoading(true)

      const result = await dispatch(
        fetchSubModuleById(id)
      )

      if (
        fetchSubModuleById.fulfilled.match(
          result
        )
      ) {
        setSubModule(result.payload)
      }

      setPageLoading(false)
    }

    void loadModule()
  }, [dispatch, id])


const handleSubmit = async (
    data: SubModuleFormData
  ) => {
    if (!id) return

    const result = await dispatch(
      editSubModule({
        ...data,
        id: Number(id),
      })
    )

    if (
      editSubModule.fulfilled.match(result)
    ) {
      navigate("/submodule")
    }
  }
              if (pageLoading) {
                    return (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                        Loading module...
                        </p>
                    </div>
                    )
                }
   if (!submodule) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm text-destructive">
           Sub Module not found.
        </p>

        <button
          type="button"
          className="mt-4 underline"
          onClick={() =>
            navigate("/submodule")
          }
        >
          Back to  Sub Modules
        </button>
      </div>
    )
  }
    return(

        <>
        <div className="w-full">
       
             <SubmodulesForm
            //    initialData={submodule}
            initialData={{
  ...submodule,
  note: submodule.note ?? "",
}}
               loading={loading}
               onSubmit={handleSubmit}
               onCancel={() =>
                 navigate("/submodule")
               }
             />
       
           </div>
        </>
    )
}