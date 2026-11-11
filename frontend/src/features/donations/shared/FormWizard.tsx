import type { ReactNode } from "react"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

import type { StepDefinition } from "./donationFormTypes"

function StepIndicator({ steps, current }: { steps: readonly StepDefinition[]; current: number }) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {steps.map((stepItem, index) => {
        const Icon = stepItem.icon
        const active = current === stepItem.id
        const done = current > stepItem.id
        return (
          <div key={stepItem.id} className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                  active || done
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-4.5" />
              </span>
              <div className="leading-tight">
                <p
                  className={cn(
                    "text-sm font-medium",
                    !active && !done && "text-muted-foreground"
                  )}
                >
                  {stepItem.label}
                </p>
                <p className="text-xs text-muted-foreground">{stepItem.subLabel}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export interface FormWizardProps {
  steps: readonly StepDefinition[]
  currentStep: number
  title: ReactNode
  subtitle?: ReactNode
  onBack: () => void
  backDisabled?: boolean
  footer: ReactNode
  children: ReactNode
}

export function FormWizard({
  steps,
  currentStep,
  title,
  subtitle,
  onBack,
  backDisabled,
  footer,
  children,
}: FormWizardProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="w-full">
        <CardHeader className="gap-4 border-b pb-4">
          <StepIndicator steps={steps} current={currentStep} />
        </CardHeader>

        <CardContent className="flex flex-col gap-6 pt-4">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          {children}

          <div className="flex items-center justify-between border-t pt-4">
            <Button type="button" variant="outline" onClick={onBack} disabled={backDisabled}>
              <ArrowLeft /> Previous
            </Button>
            {footer}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
