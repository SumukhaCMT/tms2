import { useEffect, useRef, useState, type FormEvent } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { Check, X, Loader2 } from "lucide-react"
import { ResetLinkStatus, type ResetLinkStatusCode } from "./ResetLinkStatus"

interface ValidateTokenResponse {
  code: "VALID" | "EXPIRED" | "INVALID" | "USED" | "BLOCKED_30" | "BLOCKED_24H"
  message: string
  blockedUntil: string | null
}

interface ResetPasswordResponse {
  code: "SUCCESS" | "EXPIRED" | "INVALID" | "USED" | "WEAK_PASSWORD" | "BLOCKED_30" | "BLOCKED_24H"
  message: string
  blockedUntil?: string | null
  fromSecurityAlert?: boolean
}

const getFormattedDate = () => {
  return new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get("token")

  const [checking, setChecking] = useState<boolean>(() => Boolean(token))
  const [linkStatus, setLinkStatus] = useState<ResetLinkStatusCode | null>(() => (token ? null : "INVALID"))
  const [blockedUntil, setBlockedUntil] = useState<string | null>(null)

  const [pass, setPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [loading, setLoading] = useState(false)

  const validations = {
    "Min 8 chars": pass.length >= 8,
    Lowercase: /[a-z]/.test(pass),
    Uppercase: /[A-Z]/.test(pass),
    Number: /[0-9]/.test(pass),
    "Special Char": /[^A-Za-z0-9]/.test(pass),
  }

  const isValid = Object.values(validations).every(Boolean)

  const validatedTokenRef = useRef<string | null>(null)

  // Tracks real mount state, not per-effect-invocation state. A plain local
  // `cancelled` variable closed over inside the token-guarded effect below
  // breaks under StrictMode's dev-only double-invoke: the first invocation's
  // cleanup (StrictMode's synthetic unmount) would flip that *specific*
  // closure's `cancelled` to true, but the actual in-flight request belongs
  // to that same first invocation (the second invocation bails out via the
  // ref guard and never starts a new request or cleanup). So the one real
  // response would always see cancelled === true and setChecking(false)
  // would never run, leaving the page stuck on the loading spinner forever.
  // An empty-deps effect settles back to mounted === true once StrictMode's
  // mount -> cleanup -> mount dance finishes, so it reflects real unmounts only.
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!token) return

    // Guard against React StrictMode's dev-only double-invocation of this
    // effect, which was firing validate-reset-token twice per page load and
    // silently burning 2 of the 3 allowed attempts per real click.
    if (validatedTokenRef.current === token) return
    validatedTokenRef.current = token

    api
      .get<ValidateTokenResponse>("/auth/validate-reset-token", { params: { token } })
      .then((res) => {
        if (!isMountedRef.current) return

        const { code, blockedUntil: until } = res.data

        if (code === "VALID") {
          setLinkStatus(null)
        } else {
          setLinkStatus(code)
          setBlockedUntil(until)
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) return

        const data: ValidateTokenResponse | undefined = err.response?.data
        const errorCode = data?.code
        setLinkStatus(errorCode && errorCode !== "VALID" ? errorCode : "INVALID")
        setBlockedUntil(data?.blockedUntil ?? null)
      })
      .finally(() => {
        if (isMountedRef.current) setChecking(false)
      })
  }, [token])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (pass !== confirmPass) return showCmtToast("expiry", "Passwords do not match")
    if (!token) return showCmtToast("expiry", "Cannot submit: Missing token")

    setLoading(true)
    const res = await api
      .post<ResetPasswordResponse>("/auth/reset-password", {
        token,
        password: pass,
      })
      .catch((err) => err.response)

    setLoading(false)

    const data: ResetPasswordResponse | undefined = res?.data

    if (res?.status === 200 && data?.code === "SUCCESS") {
      showCmtToast(
        "success",
        data.fromSecurityAlert ? data.message : `Password has been reset — ${getFormattedDate()}`,
      )
      setTimeout(() => navigate("/login"), 2000)
      return
    }

    if (data?.code === "WEAK_PASSWORD") {
      showCmtToast("expiry", "Password does not meet the required strength.")
      return
    }

    if (
      data?.code === "EXPIRED" ||
      data?.code === "INVALID" ||
      data?.code === "USED" ||
      data?.code === "BLOCKED_30" ||
      data?.code === "BLOCKED_24H"
    ) {
      setLinkStatus(data.code)
      setBlockedUntil(data.blockedUntil ?? null)
      showCmtToast("expiry", data.message || "Link expired or invalid")
      return
    }

    showCmtToast("expiry", data?.message || "Link expired or invalid")
  }

  if (checking) {
    return <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
  }

  if (linkStatus) {
    return <ResetLinkStatus code={linkStatus} blockedUntil={blockedUntil} token={token} />
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-sm text-muted-foreground">Enter your new password below.</p>
        </div>
        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <Input id="password" type="password" className="h-10" value={pass} onChange={(e) => setPass(e.target.value)} required />
          <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/50 p-3">
            {Object.entries(validations).map(([label, val]) => (
              <div key={label} className={`flex items-center text-xs ${val ? "font-medium text-green-600" : "text-muted-foreground"}`}>
                {val ? <Check className="mr-1.5 size-3.5" /> : <X className="mr-1.5 size-3.5" />}
                {label}
              </div>
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            className="h-10"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
          />
        </Field>
        <Field>
          <Button type="submit" size="lg" className="h-10" disabled={loading || !isValid}>
            {loading && <Loader2 className="animate-spin" />}
            Update Password
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
