import { ArrowLeft, Check, Loader2, Repeat, Repeat2, UserRound } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { FormStep, FormWizard, type StepDefinition } from "@/components/ui/form-wizard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { TextField, SelectField, TextareaField } from "@/features/donations/shared/DonationFormFields"

import { useEditUserForm } from "./useEditUserForm"
import { capitalize } from "./usersTypes"

const EDIT_USER_STEPS: StepDefinition[] = [
  { id: 1, label: "User Details", subLabel: "Contact, role and status", icon: UserRound },
  { id: 2, label: "Change Temple", subLabel: "Move to another temple", icon: Repeat2 },
]

export default function EditUser() {
  const { id } = useParams()
  const {
    user,
    statuses,
    roles,
    loading,
    form,
    errors,
    saving,
    transfer,
    transferErrors,
    transferring,
    templeOptions,
    updateForm,
    updateTransfer,
    handleSave,
    handleTransfer,
  } = useEditUserForm()

  if (loading) return <Skeleton className="h-96 w-full" />

  if (!user || !form) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
        <p className="text-sm font-medium">User not found</p>
        <Button className="mt-4" variant="outline" render={<Link to="/users" />}>
          <ArrowLeft /> Back to Users
        </Button>
      </div>
    )
  }

  return (
    <FormWizard
      steps={EDIT_USER_STEPS}
      title="Edit User"
      subtitle={user.user_code}
      cancelButton={
        <Button variant="outline" render={<Link to="/users" />}>
          <ArrowLeft /> Back
        </Button>
      }
      submitButton={
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Check />} Save Changes
        </Button>
      }
    >
      <FormStep step={1}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            name="userName"
            label="Full Name"
            required
            value={form.userName}
            onChange={(value) => updateForm("userName", value)}
            error={errors.userName}
          />
          <TextField
            name="userEmail"
            label="Email"
            type="email"
            inputMode="email"
            required
            value={form.userEmail}
            onChange={(value) => updateForm("userEmail", value)}
            error={errors.userEmail}
            unique={{ entity: "users", field: "email", excludeId: id }}
          />
          <TextField
            name="userPhone"
            label="Phone"
            inputMode="tel"
            required
            maxLength={10}
            value={form.userPhone}
            onChange={(value) => updateForm("userPhone", value.replace(/\D/g, ""))}
            error={errors.userPhone}
            unique={{ entity: "users", field: "phone", excludeId: id }}
          />
          <SelectField
            name="roleId"
            label="Role"
            required
            value={form.roleId}
            onChange={(value) => updateForm("roleId", value)}
            options={roles}
            error={errors.roleId}
          />
          <TextField
            name="designationName"
            label="Role Name (Designation)"
            required
            maxLength={100}
            value={form.designationName}
            onChange={(value) => updateForm("designationName", value)}
            error={errors.designationName}
          />
          <SelectField
            name="userStatus"
            label="Status"
            required
            value={form.userStatus}
            onChange={(value) => updateForm("userStatus", value)}
            options={statuses.map((status) => ({ value: status, label: capitalize(status) }))}
            error={errors.userStatus}
          />
        </div>
      </FormStep>

      <FormStep step={2}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField name="presentTemple" label="Present Temple" value={user.temp_name ?? "-"} onChange={() => {}} disabled />
          <SelectField
            name="toTempleId"
            label="New Temple"
            required
            value={transfer.toTempleId}
            onChange={(value) => updateTransfer("toTempleId", value)}
            options={templeOptions}
            error={transferErrors.toTempleId}
            placeholder={templeOptions.length ? "Select a temple" : "No other temples found"}
            disabled={!templeOptions.length}
          />
        </div>
        <TextareaField
          name="transferReason"
          label="Transfer Reason *"
          value={transfer.transferReason}
          onChange={(value) => updateTransfer("transferReason", value)}
          error={transferErrors.transferReason}
          placeholder="Why is this user being moved?"
        />
        <div className="flex justify-end">
          <Button type="button" onClick={handleTransfer} disabled={transferring || !templeOptions.length}>
            {transferring ? <Loader2 className="animate-spin" /> : <Repeat />} Change Temple
          </Button>
        </div>
      </FormStep>
    </FormWizard>
  )
}
