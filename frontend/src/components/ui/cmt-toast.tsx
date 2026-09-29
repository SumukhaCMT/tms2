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

export function CmtToast({ variant, message, duration }: CmtToastProps) {
  const [position, setPosition] = useState(100)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPosition(0))
    return () => cancelAnimationFrame(frame)
  }, [])

  const Icon = variant === "success" ? CircleCheck : TriangleAlert

  return (
    <div
      className={`mt-20 w-90 overflow-hidden rounded-lg bg-size-[200%_100%] text-white shadow-lg transition-[background-position] ease-linear ${variantGradient[variant]}`}
      style={{ backgroundPosition: `${position}% 0%`, transitionDuration: `${duration}ms` }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium leading-snug">{message}</p>
      </div>
    </div>
  )
}


export function showCmtToast(variant: CmtToastVariant, message: string, duration = 4000) {
  toast.custom(() => <CmtToast variant={variant} message={message} duration={duration} />, {
    position: "top-center",
    duration,
  })
}
