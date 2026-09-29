import { useEffect, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import { useDispatch, useSelector } from "react-redux"

import type { AppDispatch } from "@/app/store"

import ModulesForm from "../components/ModulesForm"

import {
  fetchModuleById,
  editModule,
} from "../moduleThunks"

import {
  selectModulesLoading,
} from "../modulesSelectors"

import type { ModuleFormData } from "../moduleValidation"

import type { Module } from "../moduleTypes"

export default function EditModule() {
  const { id } = useParams<{
    id: string
  }>()

  const navigate = useNavigate()

  const dispatch = useDispatch<AppDispatch>()

  const loading = useSelector(
    selectModulesLoading
  )

  const [module, setModule] =
    useState<Module | null>(null)

  const [pageLoading, setPageLoading] =
    useState(true)

  useEffect(() => {
    if (!id) return

    const loadModule = async () => {
      setPageLoading(true)

      const result = await dispatch(
        fetchModuleById(id)
      )

      if (
        fetchModuleById.fulfilled.match(
          result
        )
      ) {
        setModule(result.payload)
      }

      setPageLoading(false)
    }

    void loadModule()
  }, [dispatch, id])

  const handleSubmit = async (
    data: ModuleFormData
  ) => {
    if (!id) return

    const result = await dispatch(
      editModule({
        ...data,
        id: Number(id),
      })
    )

    if (
      editModule.fulfilled.match(result)
    ) {
      navigate("/modules")
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

  if (!module) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm text-destructive">
          Module not found.
        </p>

        <button
          type="button"
          className="mt-4 underline"
          onClick={() =>
            navigate("/modules")
          }
        >
          Back to Modules
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">

      <ModulesForm
        initialData={module}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate("/modules")
        }
      />

    </div>
  )
}