import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { type AxiosResponse } from "axios"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { cn } from "@/lib/utils"
import api from "@/axios/axios"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "./useAuth"
import { UnblockRequestNotice } from "./UnblockRequestNotice"

export default function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [data, setData] = useState({ login: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [blocked, setBlocked] = useState<{ login: string; message: string } | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    setError("")
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setBlocked(null)

    const payload = {
      login: data.login.trim(),
      password: data.password
    }

    const res: AxiosResponse | undefined = await api
      .post("/auth/login", payload)
      .catch((err) => err.response)

    setLoading(false)

    if (!res) {
      setError("Network Error: Could not reach server")
      return
    }

    if (res.status === 200) {
      const loginData = res.data
      if (loginData?.user && loginData?.access_token) {
        login(loginData.user, loginData.access_token)
        navigate("/dashboard")
      } else {
        setError("Server Error: Missing tokens in response")
      }
      return
    }

    if (res.status === 404) {
      setError("User not found. Please register an account.")
      return
    }

    if (res.status === 401) {
      setError("Invalid password. Please try again.")
      return
    }

    if (res.status === 429) {
      showCmtToast("expiry", res.data?.message || "Too many attempts. Please try again later.")
      return
    }

    if (res.status === 403 && res.data?.code === "ACCOUNT_BLOCKED") {
      setBlocked({ login: payload.login, message: res.data.message })
      return
    }

    if (res.status === 403) {
      showCmtToast("expiry", res.data?.message || "Cannot login")
      return
    }

    setError(res.data?.message || res.data?.error || "Login failed")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="login">Email or Phone</FieldLabel>
                    <Input
                      id="login"
                      type="text"
                      placeholder="tms@mail.com"
                      required
                      value={data.login}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link
                        to="/forgot-password"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={data.password}
                        onChange={handleChange}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </Field>

                  {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                  {blocked && <UnblockRequestNotice message={blocked.message} login={blocked.login} />}

                  <Field>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Signing in..." : "Login"}
                    </Button>

                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}