export type DefineHundiStatus = "active" | "inactive"

export interface DefineHundiApiRow {
  id: number
  temple_id: number
  temp_name: string
  deity_id: number
  deity_name: string
  hundi_number: string
  hundi_name: string
  status: DefineHundiStatus
  created_at: string
}

export interface DefineHundiForm {
  templeId: string
  deityId: string
  hundiNumber: string
  hundiName: string
  status: DefineHundiStatus
}

export function emptyDefineHundiForm(): DefineHundiForm {
  return {
    templeId: "",
    deityId: "",
    hundiNumber: "",
    hundiName: "",
    status: "active",
  }
}

export type FormErrors = Record<string, string>
