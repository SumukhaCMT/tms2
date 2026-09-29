import { useEffect, useState } from "react"

import {
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom"

import { useDispatch } from "react-redux"

import type { AppDispatch } from "@/app/store"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { fetchModuleById } from "../moduleThunks"

import type { Module } from "../moduleTypes"

export default function ViewModule() {
  const { id } = useParams<{
    id: string
  }>()

  const navigate = useNavigate()

  const dispatch = useDispatch<AppDispatch>()

  const [module, setModule] =
    useState<Module | null>(null)

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    if (!id) return

    const loadModule = async () => {
      setLoading(true)

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

      setLoading(false)
    }

    void loadModule()
  }, [dispatch, id])

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        Loading module...
      </div>
    )
  }

  if (!module) {
    return (
      <div className="p-6 text-center">
        Module not found.
      </div>
    )
  }

  return (
    <Card className="w-full">

      <CardHeader className="flex flex-row items-center justify-between">

        <CardTitle>
          Module Details
        </CardTitle>

        <Button >
          <NavLink
            to={`/modules/edit/${module.id}`}
          >
            Edit
          </NavLink>
        </Button>

      </CardHeader>

      <CardContent>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          <div>
            <p className="text-sm text-muted-foreground">
              Module Code
            </p>

            <p className="font-medium capitalize">
              {module.module_code}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground capitalize">
              Module Name
            </p>

            <p className="font-medium capitalize">
              {module.module_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground capitalize">
              Module Type
            </p>

            <p className="font-medium capitalize">
              {module.module_type}
            </p>
          </div>

          {module.module_type ===
            "capacity" && (
            <div>
              <p className="text-sm text-muted-foreground capitalize">
                Capacity Type
              </p>

              <p className="font-medium capitalize">
                {module.capacity_type ??
                  "-"}
              </p>
            </div>
          )}

          {module.module_type ===
            "consumable" && (
            <div>
              <p className="text-sm text-muted-foreground capitalize">
                Consumable Type
              </p>

              <p className="font-medium capitalize">
                {module.consumable_type ??
                  "-"}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">
              Display Order
            </p>

            <p className="font-medium">
              {module.display_order}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground capitalize">
              Status
            </p>

            <p className="font-medium capitalize capitalize">
              {module.status}
            </p>
          </div>

        </div>

        <div className="mt-6">

          <Button
           className="cursor-pointer"
            type="button"
            variant="outline"
            onClick={() =>
              navigate("/modules")
            }
          >
            Back
          </Button>

        </div>

      </CardContent>

    </Card>
  )
}