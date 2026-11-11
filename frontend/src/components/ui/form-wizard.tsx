import { createContext, useContext, useEffect, useRef, useState, type ComponentType, type MouseEvent, type ReactNode } from "react"
import { ArrowLeft, ArrowRight, Check, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LIVE_INVALID_ATTR, LiveValidationContext } from "@/hooks/useLiveValidation"

export interface StepDefinition {
  id: number
  label: string
  subLabel: string
  icon: ComponentType<{ className?: string }>
}

const StepContext = createContext(1)

const STEP_ATTR = "data-wizard-step"

export function FormStep({ step, className, children }: { step: number; className?: string; children: ReactNode }) {
  const current = useContext(StepContext)
  return (
    <div {...{ [STEP_ATTR]: step }} className={cn("flex flex-col gap-6", current !== step && "hidden", className)}>
      {children}
    </div>
  )
}

function StepIndicator({ steps, current, onSelect }: { steps: readonly StepDefinition[]; current: number; onSelect?: (step: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {steps.map((item, index) => {
        const Icon = item.icon
        const active = current === item.id
        const done = current > item.id
        return (
          <div key={item.id} className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(item.id)}
              className="flex items-center gap-2.5 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 enabled:cursor-pointer"
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                  active || done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4.5" /> : <Icon className="size-4.5" />}
              </span>
              <span className="leading-tight">
                <span className={cn("block text-sm font-medium", !active && !done && "text-muted-foreground")}>{item.label}</span>
                <span className="block text-xs text-muted-foreground">{item.subLabel}</span>
              </span>
            </button>
            {index < steps.length - 1 && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
          </div>
        )
      })}
    </div>
  )
}

export interface FormWizardProps {
  steps: readonly StepDefinition[]
  title: ReactNode
  subtitle?: ReactNode
  currentStep?: number
  onBack?: () => void
  backDisabled?: boolean
  footer?: ReactNode
  formId?: string
  onSubmit?: () => void
  submitLabel?: ReactNode
  submitting?: boolean
  submitDisabled?: boolean
  onCancel?: () => void
  cancelButton?: ReactNode
  submitButton?: ReactNode
  extraActions?: ReactNode
  children: ReactNode
}

export function FormWizard({
  steps,
  title,
  subtitle,
  currentStep,
  onBack,
  backDisabled,
  footer,
  formId,
  onSubmit,
  submitLabel = "Save",
  submitting,
  submitDisabled,
  onCancel,
  cancelButton,
  submitButton,
  extraActions,
  children,
}: FormWizardProps) {
  const [internalStep, setInternalStep] = useState(steps[0]?.id ?? 1)
  const contentRef = useRef<HTMLDivElement>(null)
  const controlled = currentStep !== undefined
  const step = controlled ? currentStep : internalStep
  const isFirst = step === steps[0]?.id
  const isLast = step === steps[steps.length - 1]?.id

  useEffect(() => {
    const content = contentRef.current
    if (!content || controlled) return
    let handled = false
    const onInvalid = (event: Event) => {
      if (handled) return
      const target = (event.target as Element).closest(`[${STEP_ATTR}]`)
      if (!target) return
      handled = true
      setInternalStep(Number(target.getAttribute(STEP_ATTR)))
      requestAnimationFrame(() => {
        handled = false
      })
    }
    content.addEventListener("invalid", onInvalid, true)
    return () => content.removeEventListener("invalid", onInvalid, true)
  }, [controlled])

  function jumpToError() {
    const section = contentRef.current?.querySelector(`[${STEP_ATTR}]:has([aria-invalid="true"])`)
    if (section) setInternalStep(Number(section.getAttribute(STEP_ATTR)))
  }

  function findInvalid() {
    const fields = Array.from(contentRef.current?.querySelectorAll<HTMLInputElement>(`[${LIVE_INVALID_ATTR}="true"]`) ?? [])
    return fields.find((field) => {
      const section = field.closest(`[${STEP_ATTR}]`)
      return isLast || !section || Number(section.getAttribute(STEP_ATTR)) === step
    })
  }

  function blockInvalid() {
    const invalid = findInvalid()
    if (!invalid) return false
    const section = invalid.closest(`[${STEP_ATTR}]`)
    if (section && !controlled) setInternalStep(Number(section.getAttribute(STEP_ATTR)))
    requestAnimationFrame(() => invalid.reportValidity())
    return true
  }

  function guard(event: MouseEvent<HTMLElement>) {
    const button = (event.target as Element).closest("button")
    if (!button || button.disabled || button.dataset.variant !== "default" || !blockInvalid()) return false
    event.preventDefault()
    event.stopPropagation()
    return true
  }

  function next() {
    const section = contentRef.current?.querySelector(`[${STEP_ATTR}="${step}"]`)
    const fields = section ? Array.from(section.querySelectorAll<HTMLInputElement>("input, select, textarea")) : []
    const invalid = fields.find((field) => !field.checkValidity())
    if (invalid) return invalid.reportValidity()
    setInternalStep(step + 1)
  }

  function submit() {
    if (blockInvalid()) return
    window.setTimeout(jumpToError, 300)
    onSubmit?.()
  }

  const defaultFooter = (
    <>
      {isFirst && cancelButton ? (
        cancelButton
      ) : isFirst && onCancel ? (
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      ) : (
        <Button type="button" variant="outline" onClick={() => setInternalStep(step - 1)} disabled={isFirst || submitting}>
          <ArrowLeft /> Previous
        </Button>
      )}
      <div className="flex items-center gap-2">
        {extraActions}
        {isLast && submitButton ? (
          <span className="contents" onClickCapture={(event) => guard(event) || window.setTimeout(jumpToError, 300)}>
            {submitButton}
          </span>
        ) : isLast ? (
          <Button type={onSubmit ? "button" : "submit"} form={onSubmit ? undefined : formId} onClick={submit} disabled={submitting || submitDisabled}>
            {submitting ? <Loader2 className="animate-spin" /> : <Check />} {submitLabel}
          </Button>
        ) : (
          <Button type="button" onClick={next}>
            Next <ArrowRight />
          </Button>
        )}
      </div>
    </>
  )

  return (
    <Card className="w-full">
      <CardHeader className="gap-4 border-b pb-4">
        <StepIndicator steps={steps} current={step} onSelect={controlled ? undefined : setInternalStep} />
      </CardHeader>

      <CardContent className="flex flex-col gap-6 pt-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <LiveValidationContext.Provider value>
          <StepContext.Provider value={step}>
            <div ref={contentRef} className="flex flex-col gap-6">
              {children}
            </div>
          </StepContext.Provider>
        </LiveValidationContext.Provider>

        <div className="flex items-center justify-between gap-2 border-t pt-4">
          {controlled ? (
            <>
              {isFirst && cancelButton ? (
                cancelButton
              ) : (
                <Button type="button" variant="outline" onClick={onBack} disabled={backDisabled}>
                  <ArrowLeft /> Previous
                </Button>
              )}
              <span className="contents" onClickCapture={guard}>
                {footer}
              </span>
            </>
          ) : (
            defaultFooter
          )}
        </div>
      </CardContent>
    </Card>
  )
}
