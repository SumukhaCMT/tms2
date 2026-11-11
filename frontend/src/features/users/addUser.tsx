import { Loader2, Check, ArrowRight, Copy, KeyRound } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { TextField, SelectField, SummaryRow } from "@/features/donations/shared/DonationFormFields"
import { FormWizard } from "@/components/ui/form-wizard"

import { useAddUserForm } from "./useAddUserForm"
import { ADD_USER_STEPS, capitalize } from "./usersTypes"

export default function AddUser() {
  const {
    step,
    temples,
    statuses,
    roles,
    loading,
    form,
    errors,
    submitting,
    password,
    templeName,
    updateForm,
    handleNext,
    handleBack,
    handleSubmit,
    copyPassword,
  } = useAddUserForm()

  if (password) {
    return (
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <KeyRound className="size-5" />
          </span>
          <h1 className="mt-2 text-xl font-semibold">User Created</h1>
          <p className="text-sm text-muted-foreground">
            Share these login details with {form.userName}. The password is shown only once and has also been emailed.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <SummaryRow label="Login Email" value={form.userEmail} />
            <SummaryRow label="Phone" value={form.userPhone} />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/50 p-4">
            <code className="text-base font-semibold tracking-wider">{password}</code>
            <Button type="button" variant="outline" size="sm" onClick={copyPassword}>
              <Copy /> Copy
            </Button>
          </div>
          <Button render={<Link to="/users" />}>Go to Users</Button>
        </CardContent>
      </Card>
    )
  }

  const roleLabel = roles.find((option) => option.value === form.roleId)?.label ?? ""
  const stepTitle = ADD_USER_STEPS.find((definition) => definition.id === step)?.label ?? ""

  return (
    <FormWizard
      steps={ADD_USER_STEPS}
      currentStep={step}
      title={stepTitle}
      subtitle={templeName || undefined}
      onBack={handleBack}
      backDisabled={step === 1 || submitting}
      footer={
        step < 3 ? (
          <Button type="button" onClick={handleNext} disabled={loading}>
            Next <ArrowRight />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <Check />} Create User
          </Button>
        )
      }
    >
      {step === 1 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SelectField
            name="templeId"
            label="Temple"
            required
            value={form.templeId}
            onChange={(value) => updateForm("templeId", value)}
            options={temples.map((temple) => ({ value: String(temple.id), label: temple.temp_name }))}
            error={errors.templeId}
            placeholder={loading ? "Loading temples…" : temples.length ? "Select a temple" : "No temples found"}
            disabled={loading || !temples.length}
          />
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            name="userName"
            label="Full Name"
            required
            value={form.userName}
            onChange={(value) => updateForm("userName", value)}
            error={errors.userName}
            placeholder="e.g. Ramesh Kumar"
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
            placeholder="name@example.com"
            unique={{ entity: "users", field: "email" }}
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
            placeholder="10-digit mobile number"
            unique={{ entity: "users", field: "phone" }}
          />
          <SelectField
            name="roleId"
            label="Role"
            required
            value={form.roleId}
            onChange={(value) => updateForm("roleId", value)}
            options={roles}
            error={errors.roleId}
            placeholder="Select a role"
          />
          <TextField
            name="designationName"
            label="Role Name (Designation)"
            required
            maxLength={100}
            value={form.designationName}
            onChange={(value) => updateForm("designationName", value)}
            error={errors.designationName}
            placeholder="e.g. Head Priest"
          />
          <SelectField
            name="userStatus"
            label="Status"
            required
            value={form.userStatus}
            onChange={(value) => updateForm("userStatus", value)}
            options={statuses.map((status) => ({ value: status, label: capitalize(status) }))}
            error={errors.userStatus}
            placeholder="Select a status"
          />
        </div>
      )}

      {step === 3 && (
        <Card size="sm">
          <CardHeader>
            <p className="text-sm font-medium">User Details</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryRow label="Temple" value={templeName} />
            <SummaryRow label="Full Name" value={form.userName} />
            <SummaryRow label="Email" value={form.userEmail} />
            <SummaryRow label="Phone" value={form.userPhone} />
            <SummaryRow label="Role" value={roleLabel} />
            <SummaryRow label="Role Name" value={form.designationName.trim()} />
            <SummaryRow label="Status" value={capitalize(form.userStatus)} />
            <SummaryRow label="Password" value="Auto-generated on submit" />
          </CardContent>
        </Card>
      )}
    </FormWizard>
  )
}
