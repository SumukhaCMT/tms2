import { useEffect, useState } from "react"
import { CircleCheck, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

export type CmtToastVariant = "success" | "expiry"

interface CmtToastProps {
  variant: CmtToastVariant
  message: string
  duration: number
}

const variantGradient: Record<CmtToastVariant, string> = {
  success: "bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-900",
  expiry: "bg-gradient-to-r from-[#3D0809] via-[#7B1113] to-[#3D0809]",
}

const FEATHER = "linear-gradient(to right, #000 0%, #000 50%, transparent 50%)"

const variantText: Record<CmtToastVariant, string> = {
  success: "text-emerald-900",
  expiry: "text-[#7B1113]",
}

function ToastContent({ variant, message }: { variant: CmtToastVariant; message: string }) {
  const Icon = variant === "success" ? CircleCheck : TriangleAlert

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium leading-snug">{message}</p>
    </div>
  )
}

export function CmtToast({ variant, message, duration }: CmtToastProps) {
  const [position, setPosition] = useState(100)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPosition(0))
    return () => cancelAnimationFrame(frame)
  }, [])

  const mask = {
    maskImage: FEATHER,
    WebkitMaskImage: FEATHER,
    maskSize: "200% 100%",
    WebkitMaskSize: "200% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: `${position}% 0%`,
    WebkitMaskPosition: `${position}% 0%`,
    transitionProperty: "mask-position, -webkit-mask-position",
    transitionDuration: `${duration}ms`,
  }

  return (
    <div className={`relative mt-20 w-90 overflow-hidden rounded-lg bg-white shadow-lg ${variantText[variant]}`}>
      <ToastContent variant={variant} message={message} />
      <div
        aria-hidden
        className={`absolute inset-0 text-white ease-linear ${variantGradient[variant]}`}
        style={mask}
      >
        <ToastContent variant={variant} message={message} />
      </div>
    </div>
  )
}

export function showCmtToast(variant: CmtToastVariant, message: string, duration = 4000) {
  toast.custom(() => <CmtToast variant={variant} message={message} duration={duration} />, {
    position: "top-right",
    duration,
  })
}
