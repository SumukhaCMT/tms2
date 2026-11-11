import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Check, X, Loader2 } from "lucide-react"

import api from "@/axios/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { useAuth } from "./useAuth"

export default function SetPassword() {
  const navigate = useNavigate()
  const { completePasswordChange, logout } = useAuth()
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
  const mismatch = confirmPass.length > 0 && pass !== confirmPass

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (pass !== confirmPass) return showCmtToast("expiry", "Passwords do not match")
    setLoading(true)
    const res = await api.put("/auth/first-password", { password: pass, confirmPassword: confirmPass }).catch((err) => err.response)
    setLoading(false)
    if (res?.status !== 200) return showCmtToast("expiry", res?.data?.message || "Failed to update password")
    showCmtToast("success", "Password updated successfully")
    completePasswordChange()
    navigate("/dashboard", { replace: true })
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Set New Password</CardTitle>
            <CardDescription>You are logging in for the first time. Set a new password to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="New Password" autoComplete="new-password" required />
                <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/50 p-3">
                  {Object.entries(validations).map(([label, ok]) => (
                    <div key={label} className={`flex items-center text-xs ${ok ? "font-medium text-green-600" : "text-muted-foreground"}`}>
                      {ok ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <X className="mr-1.5 h-3.5 w-3.5" />}
                      {label}
                    </div>
                  ))}
                </div>
                <Input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  aria-invalid={mismatch}
                  required
                />
                {mismatch && <p className="text-xs text-destructive">Passwords do not match</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading || !isValid || pass !== confirmPass}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={logout}>
                Log out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
