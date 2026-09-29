import { useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { RegisterOrganization } from "@/types/RegisterOrganization"
import type { RegisterOrganizationErrors } from "@/types/RegisterOrganizationErrors"
import { validateRegisterOrganization } from "@/utils/validateRegisterOrganization"

export default function OrganizationForm() {
  const [formData, setFormData] = useState<RegisterOrganization>({
    organization_name: "",
    temple_name: "",
    user_name: "",
    user_email: "",
    user_phone: "",
  })

  const [errors, setErrors] = useState<RegisterOrganizationErrors>({})
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSuccess("")
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationErrors = validateRegisterOrganization(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/v1/organizations/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setErrors({
          form: data?.message ?? "Registration failed. Please try again.",
        })
        return
      }

      setSuccess(
        "Organization created successfully. Admin password has been sent via email."
      )

      setFormData({
        organization_name: "",
        temple_name: "",
        user_name: "",
        user_email: "",
        user_phone: "",
      })
    } catch {
      setErrors({ form: "Server not reachable. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create Organization Account</CardTitle>
            <CardDescription>
              Enter your details to register your organization
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="organization_name">
                    Organization Name <span style={styles.star}>*</span>
                  </FieldLabel>
                  <Input
                    id="organization_name"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    placeholder="John Doe Org"
                    maxLength={50}
                  />
                  {errors.organization_name && (
                    <p className="text-sm text-red-500">
                      {errors.organization_name}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="temple_name">
                    Primary Temple <span style={styles.star}>*</span>
                  </FieldLabel>
                  <Input
                    id="temple_name"
                    name="temple_name"
                    value={formData.temple_name}
                    onChange={handleChange}
                    placeholder="ABC Temple"
                    maxLength={50}
                  />
                  {errors.temple_name && (
                    <p className="text-sm text-red-500">
                      {errors.temple_name}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="user_name">
                    Admin Name <span style={styles.star}>*</span>
                  </FieldLabel>
                  <Input
                    id="user_name"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    maxLength={50}
                  />
                  {errors.user_name && (
                    <p className="text-sm text-red-500">
                      {errors.user_name}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="user_email">
                    Email <span style={styles.star}>*</span>
                  </FieldLabel>
                  <Input
                    id="user_email"
                    name="user_email"
                    type="email"
                    value={formData.user_email}
                    onChange={handleChange}
                    placeholder="cmt@tms.com"
                  />
                  {errors.user_email && (
                    <p className="text-sm text-red-500">
                      {errors.user_email}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="user_phone">
                    Phone Number <span style={styles.star}>*</span>
                  </FieldLabel>
                  <Input
                    id="user_phone"
                    name="user_phone"
                    type="tel"
                    value={formData.user_phone}
                    onChange={handleChange}
                    placeholder="9234567890"
                  />
                  {errors.user_phone && (
                    <p className="text-sm text-red-500">
                      {errors.user_phone}
                    </p>
                  )}
                </Field>

                {errors.form && (
                  <p className="text-sm text-red-600">{errors.form}</p>
                )}

                {success && (
                  <p className="text-sm text-green-600">{success}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Creating..." : "Create Organization"}
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                >
                  Sign up with Google
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link to="/" className="underline">
                    Sign in
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  star: {
    color: "red"
  }
};
