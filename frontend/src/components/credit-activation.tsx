import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { Spinner } from "@/components/ui/spinner"
import { formatDate, type CreditPlan, type CreditType } from "@/features/subscription/pricingCart"
import { activateCredits, apiErrorMessage, getCredits } from "@/features/subscription/services/cartService"

interface Prompt {
  next: CreditPlan
  expiry: string | null
  action: () => void
}

const lastDay = (value: string) => formatDate(new Date(new Date(value).getTime() - 86400000).toISOString())

export function useCreditActivation(type: CreditType, label: string) {
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [activating, setActivating] = useState(false)

  const guard = async (action: () => void) => {
    try {
      const status = await getCredits(type)
      if (status.remaining > 0) return action()
      if (!status.next) return toast.error(`Your ${label} credits are over. Please purchase a new ${label} plan.`)
      setPrompt({ next: status.next, expiry: status.expiry_date, action })
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const activate = async () => {
    if (!prompt) return
    setActivating(true)
    try {
      await activateCredits(type)
      showCmtToast("success", `${prompt.next.plan_name} activated successfully`)
      setPrompt(null)
      prompt.action()
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setActivating(false)
    }
  }

  const dialog = (
    <AlertDialog open={!!prompt} onOpenChange={(open) => !open && !activating && setPrompt(null)}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{label} credits are over</AlertDialogTitle>
          <AlertDialogDescription>
            Your existing {label} credits are used up
            {prompt?.expiry ? ` before the plan ends on ${lastDay(prompt.expiry)}` : ""}. Shall we start your new plan{" "}
            <span className="font-medium text-foreground">{prompt?.next.plan_name}</span> with {prompt?.next.credits} credits now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={activating}>
            Not now
          </AlertDialogCancel>
          <AlertDialogAction className="cursor-pointer" disabled={activating} onClick={activate}>
            {activating && <Spinner />}
            Activate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { guard, dialog }
}

export const useWhatsAppCredits = () => useCreditActivation("whatsapp", "WhatsApp")
