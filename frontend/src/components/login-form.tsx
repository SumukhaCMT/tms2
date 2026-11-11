import type { ChangeEvent, ReactNode } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

interface LoginFormProps extends Omit<React.ComponentProps<"form">, "onChange"> {
  values: { login: string; password: string }
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  showPassword: boolean
  onTogglePassword: () => void
  loading: boolean
  error: string
  notice?: ReactNode
}

export function LoginForm({
  className,
  values,
  onChange,
  showPassword,
  onTogglePassword,
  loading,
  error,
  notice,
  ...props
}: LoginFormProps) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <h1 className="text-center text-2xl font-bold">Login to your account</h1>
        <Field>
          <FieldLabel htmlFor="login">Email or Phone</FieldLabel>
          <Input id="login" type="text" className="h-10" placeholder="tms@mail.com" required value={values.login} onChange={onChange} />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link to="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <InputGroup className="h-10">
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={values.password}
              onChange={onChange}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={onTogglePassword}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        {error && <FieldError>{error}</FieldError>}
        {notice}
        <Field>
          <Button type="submit" size="lg" className="h-10" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
