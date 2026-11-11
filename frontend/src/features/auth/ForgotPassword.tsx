import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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

  if (sent) {
    return (
      <FieldGroup>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Check your inbox</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for <strong>{identifier}</strong>, a password reset link will be sent to its registered email.
          </p>
        </div>
        <Button variant="outline" size="lg" className="h-10" onClick={() => setSent(false)}>
          Try another email or phone number
        </Button>
        <BackToLogin />
      </FieldGroup>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email or phone number and we'll send you a link to reset your password.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="identifier">Email or Phone</FieldLabel>
          <Input
            id="identifier"
            type="text"
            className="h-10"
            placeholder="tms@mail.com"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </Field>
        {blocked && <UnblockRequestNotice message={blocked.message} login={blocked.login} />}
        <Field>
          <Button type="submit" size="lg" className="h-10" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Send Reset Link
          </Button>
        </Field>
        <BackToLogin />
      </FieldGroup>
    </form>
  );
}

function BackToLogin() {
  return (
    <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:underline">
      <ArrowLeft className="size-3" /> Back to login
    </Link>
  );
}
