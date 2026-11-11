import { createContext, useContext, useEffect, useRef, useState, type ChangeEvent, type ComponentProps, type FocusEvent, type KeyboardEvent, type Ref, type SyntheticEvent } from "react"

import { checkUnique, detectRule, isAllowedKey, PHONE_LENGTH, validateValue, type UniqueCheck, type ValidationRule } from "@/lib/validation"

export const LiveValidationContext = createContext(false)

export const LIVE_INVALID_ATTR = "data-live-invalid"

export interface LiveValidationOptions extends ComponentProps<"input"> {
  unique?: UniqueCheck
  validate?: ValidationRule | false
}

function assignRef<T>(ref: Ref<T> | undefined, node: T) {
  if (typeof ref === "function") ref(node)
  else if (ref) ref.current = node
}

export function useLiveValidation({ unique, validate, ...props }: LiveValidationOptions) {
  const enabled = useContext(LiveValidationContext)
  const elementRef = useRef<HTMLInputElement | null>(null)
  const [typed, setTyped] = useState(props.defaultValue == null ? "" : String(props.defaultValue))
  const [touched, setTouched] = useState(false)
  const [remote, setRemote] = useState({ key: "", message: "" })

  const rule = enabled && validate !== false && !props.readOnly && !props.disabled ? validate || detectRule(props.type, props.inputMode) : undefined
  const text = (props.value == null ? typed : String(props.value)).trim()
  const formatError = rule ? validateValue(rule, text) : ""
  const uniqueKey = rule && unique && text && !formatError ? `${unique.entity}|${unique.field}|${unique.excludeId ?? ""}|${text}` : ""
  const checking = Boolean(uniqueKey) && remote.key !== uniqueKey
  const error = formatError || (uniqueKey && remote.key === uniqueKey ? remote.message : "")

  const entity = unique?.entity
  const field = unique?.field
  const excludeId = unique?.excludeId

  useEffect(() => {
    if (!uniqueKey || !entity || !field) return
    let active = true
    const timer = window.setTimeout(async () => {
      const message = await checkUnique({ entity, field, excludeId }, text)
      if (active) setRemote({ key: uniqueKey, message })
    }, 400)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [uniqueKey, entity, field, excludeId, text])

  useEffect(() => {
    if (rule) elementRef.current?.setCustomValidity(error || (checking ? "Checking availability..." : ""))
  }, [rule, error, checking])

  if (!rule) return { error: "", inputProps: props }

  const shownError = touched ? error : ""

  return {
    error: shownError,
    inputProps: {
      ...props,
      maxLength: props.maxLength ?? (rule === "phone" ? PHONE_LENGTH : undefined),
      [LIVE_INVALID_ATTR]: Boolean(error || checking),
      "aria-invalid": props["aria-invalid"] || Boolean(shownError) || undefined,
      ref: (node: HTMLInputElement | null) => {
        elementRef.current = node
        assignRef(props.ref, node)
      },
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        setTyped(event.target.value)
        setTouched(true)
        props.onChange?.(event)
      },
      onBlur: (event: FocusEvent<HTMLInputElement>) => {
        setTouched(true)
        props.onBlur?.(event)
      },
      onInvalid: (event: SyntheticEvent<HTMLInputElement>) => {
        setTouched(true)
        props.onInvalid?.(event as never)
      },
      onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
        if (!event.ctrlKey && !event.metaKey && !event.altKey && !isAllowedKey(rule, event.key)) event.preventDefault()
        props.onKeyDown?.(event)
      },
    },
  }
}
