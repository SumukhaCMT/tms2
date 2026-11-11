import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { type AxiosResponse } from "axios"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { LoginForm } from "@/components/login-form"
import api from "@/axios/axios"
import { useAuth } from "./useAuth"
import { UnblockRequestNotice } from "./UnblockRequestNotice"

export default function Login() {
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
        navigate(loginData.user.must_change_password ? "/set-password" : "/dashboard")
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
      setError("Invalid Credentials. Please try again.")
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
    <LoginForm
      onSubmit={handleSubmit}
      values={data}
      onChange={handleChange}
      showPassword={showPassword}
      onTogglePassword={() => setShowPassword(!showPassword)}
      loading={loading}
      error={error}
      notice={blocked && <UnblockRequestNotice message={blocked.message} login={blocked.login} />}
    />
  )
}
