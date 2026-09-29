import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/axios/axios";
import { showCmtToast } from "@/components/ui/cmt-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { UnblockRequestNotice } from "./UnblockRequestNotice";

interface ForgotPasswordResponse {
  code: string;
  message: string;
  blockedUntil?: string | null;
}

const formatRemainingTime = (blockedUntil?: string | null): string => {
  if (!blockedUntil) return "";

  const diffMs = new Date(blockedUntil).getTime() - Date.now();
  if (diffMs <= 0) return "";

  const totalMinutes = Math.ceil(diffMs / 60000);

  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? ` You can try again in ${hours}h ${minutes}m.` : ` You can try again in ${hours}h.`;
  }

  return ` You can try again in ${totalMinutes}m.`;
};

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [blocked, setBlocked] = useState<{ login: string; message: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setBlocked(null);

    const res = await api.post("/auth/forgot-password", { identifier }).catch((err) => err.response);

    setLoading(false);

    const data: ForgotPasswordResponse | undefined = res?.data;

    if (res?.status === 200) {
      setSent(true);
      return;
    }

    if (data?.code === "PHONE_NO_EMAIL") {
      showCmtToast("expiry", "No email address is associated with this phone number.");
      return;
    }

    if (data?.code === "RESET_REQUEST_BLOCKED" || data?.code === "BLOCKED_24H") {
      setBlocked({ login: identifier.trim(), message: data.message });
      return;
    }

    if (data?.code === "RESET_REQUEST_LIMITED") {
      showCmtToast("expiry", data?.message || "Password reset request has been limited. Try again after 15 minutes.");
      return;
    }

    if (data?.code === "BLOCKED_30") {
      showCmtToast("expiry", `Password reset is temporarily blocked.${formatRemainingTime(data.blockedUntil)}`);
      return;
    }

    showCmtToast("expiry", data?.message || "Something went wrong");
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-gray-50/50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border">
        {sent ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-green-600">Check your inbox</h1>
            <p className="text-muted-foreground">
              If an account exists for <strong>{identifier}</strong>, a password reset link will been sent to its registered email.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              Try another email or phone number
            </Button>
            <Link to="/login" className="block text-sm text-primary hover:underline mt-4">
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email address or phone number and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Email or phone number"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>

              {blocked && <UnblockRequestNotice message={blocked.message} login={blocked.login} />}

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="mr-2 h-3 w-3" /> Back to login
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
