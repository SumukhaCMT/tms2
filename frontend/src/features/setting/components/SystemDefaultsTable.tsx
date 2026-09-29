import { useState } from "react"

import {
  Pencil,
  Save,
  X,
  Settings2,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import type {
  SystemDefault,
} from "../systemDefaultsTypes"

interface Props {
  systemDefaults: SystemDefault[]
  saving: boolean
  onUpdate: (
    id: number,
    value: number,
    description: string,
  ) => Promise<void>
}

export default function SystemDefaultsTable({
  systemDefaults,
  saving,
  onUpdate,
}: Props) {
  const [editingId, setEditingId] =
    useState<number | null>(null)

  const [editValue, setEditValue] =
    useState("")

  const [
    editDescription,
    setEditDescription,
  ] = useState("")

  const handleEdit = (
    item: SystemDefault,
  ) => {
    setEditingId(item.id)

    setEditValue(
      String(item.value_int),
    )

    setEditDescription(
      item.description ?? "",
    )
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue("")
    setEditDescription("")
  }

  const handleSave = async (
    item: SystemDefault,
  ) => {
    const value = Number(editValue)

    if (
      Number.isNaN(value) ||
      value < 0
    ) {
      return
    }

    await onUpdate(
      item.id,
      value,
      editDescription,
    )

    setEditingId(null)
    setEditValue("")
    setEditDescription("")
  }

  if (!systemDefaults.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Settings2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

          <p className="text-sm font-medium">
            No system defaults found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            There are no default settings available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {systemDefaults.map((item) => {
        const isEditing =
          editingId === item.id

        return (
          <Card
            key={item.id}
            className="flex h-full flex-col transition-shadow hover:shadow-md"
          >
            {/* =====================================
                HEADER
            ===================================== */}
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <Settings2 className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="break-all text-base font-semibold">
                      {/* {item.key_name} */}
                      {item.key_name
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </CardTitle>

                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {item.description ||
                        "No description available"}
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      handleEdit(item)
                    }
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* =====================================
                CONTENT
            ===================================== */}
            <CardContent className="flex flex-1 flex-col pt-0">
              {isEditing ? (
                <div className="flex flex-1 flex-col space-y-4">
                  {/* VALUE */}
                  <div className="space-y-2">
                    <Label htmlFor={`value-${item.id}`}>
                      Value
                    </Label>

                    <Input
                      id={`value-${item.id}`}
                      type="number"
                      min={0}
                      value={editValue}
                      onChange={(e) =>
                        setEditValue(
                          e.target.value,
                        )
                      }
                      autoFocus
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`description-${item.id}`}
                    >
                      Description
                    </Label>

                    <Input
                      id={`description-${item.id}`}
                      value={editDescription}
                      onChange={(e) =>
                        setEditDescription(
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-auto flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={
                        handleCancel
                      }
                      disabled={saving}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        handleSave(item)
                      }
                      disabled={
                        saving ||
                        editValue === ""
                      }
                    >
                      <Save className="mr-2 h-4 w-4" />

                      {saving
                        ? "Saving..."
                        : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-auto rounded-xl border bg-muted/30 p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Current Value
                      </p>

                      <p className="mt-1 text-3xl font-bold tracking-tight">
                        {item.value_int}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      ID: {item.id}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}