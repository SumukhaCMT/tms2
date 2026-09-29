import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle, Clock, ShieldAlert } from "lucide-react"
import { UnblockRequestNotice } from "./UnblockRequestNotice"

export type ResetLinkStatusCode = "INVALID" | "EXPIRED" | "USED" | "BLOCKED_30" | "BLOCKED_24H"

interface ResetLinkStatusProps {
  code: ResetLinkStatusCode
  blockedUntil: string | null
  token?: string | null
}

const formatRemainingTime = (blockedUntil: string | null): string => {
  if (!blockedUntil) return ""

  const diffMs = new Date(blockedUntil).getTime() - Date.now()
  if (diffMs <= 0) return ""

  const totalMinutes = Math.ceil(diffMs / 60000)

  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  return `${totalMinutes}m`
}

const getStatusContent = (code: ResetLinkStatusCode, remaining: string) => {
  if (code === "BLOCKED_24H") {
    return {
      icon: <ShieldAlert className="h-6 w-6 text-destructive" />,
      title: "Password Reset Blocked",
      description:
        "Password reset has been blocked for 24 hours due to repeated failed attempts. Please contact your administrator for assistance.",
    }
  }

  if (code === "BLOCKED_30") {
    return {
      icon: <Clock className="h-6 w-6 text-destructive" />,
      title: "Temporarily Blocked",
      description: remaining
        ? `Password reset is temporarily blocked due to repeated failed attempts. Please try again in ${remaining}.`
        : "Password reset is temporarily blocked due to repeated failed attempts. Please try again later.",
    }
  }

  if (code === "USED") {
    return {
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      title: "Reset Link Already Used",
      description: "This password reset link has already been used. Please request a new one.",
    }
  }

  if (code === "INVALID") {
    return {
      icon: <AlertCircle className="h-6 w-6 text-destructive" />,
      title: "Reset Link No Longer Valid",
      description:
        "This isn't your most recent reset link — only the latest email you received works. Please use that one, or request a new link below.",
    }
  }

  return {
    icon: <AlertCircle className="h-6 w-6 text-destructive" />,
    title: "Reset Link Expired",
    description: "This password reset link has expired. Please request a new one.",
  }
}

export function ResetLinkStatus({ code, blockedUntil, token }: ResetLinkStatusProps) {
  const navigate = useNavigate()

  const remaining = formatRemainingTime(blockedUntil)
  const content = getStatusContent(code, remaining)
  const showRequestAnother = code === "INVALID" || code === "EXPIRED" || code === "USED"

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              {content.icon}
            </div>
            <CardTitle className="text-xl text-destructive">{content.title}</CardTitle>
            <CardDescription>{content.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {code === "BLOCKED_24H" && token && (
              <UnblockRequestNotice message="Want this block removed? Send a request to your administrator." token={token} />
            )}
            {showRequestAnother && (
              <Button className="w-full" onClick={() => navigate("/forgot-password")}>
                Request another
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
