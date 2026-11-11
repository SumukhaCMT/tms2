import { Link, useParams } from "react-router-dom"
import { Clock } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function RenewSubscription() {
  const { code = "" } = useParams()

  return (
    <div className="flex min-h-96 flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Clock className="size-6 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold capitalize">{code.replace(/_/g, " ")} subscription expired</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Your access to this module has ended. Renew your plan to continue using it.
      </p>
      <Button render={<Link to="/plans" />}>Renew Subscription</Button>
    </div>
  )
}
