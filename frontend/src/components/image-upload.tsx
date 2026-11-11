import { useEffect, useId, useRef, useState } from "react"
import { ImageOff, ImagePlus, RefreshCw, XIcon } from "lucide-react"

import api from "@/axios/axios"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { LIVE_INVALID_ATTR } from "@/hooks/useLiveValidation"
import { IMAGE_ACCEPT, MAX_IMAGE_SIZE, describeImage, imageErrorMessage, normalizeImageFile, toWebpName } from "@/utils/imageUpload"

interface ImageUploadProps {
  label: string
  value: File | null
  onChange: (file: File | null) => void
  currentUrl?: string | null
  onRemoveCurrent?: () => void
  onScanningChange?: (scanning: boolean) => void
  uploading?: boolean
  disabled?: boolean
  className?: string
}

const GUARD_SELECTOR = "input[data-image-guard]"
const SCANNING_MESSAGE = "Please wait until the image security scan is complete."

function blockInvalidImage() {
  const invalid = Array.from(document.querySelectorAll<HTMLInputElement>(GUARD_SELECTOR)).find((input) => !input.checkValidity())
  if (!invalid) return false
  invalid.reportValidity()
  return true
}

function FilePreview({ file }: { file: File }) {
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    if (imageRef.current) imageRef.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  return <img ref={imageRef} alt={file.name} />
}

export function ImageUpload({
  label,
  value,
  onChange,
  currentUrl = null,
  onRemoveCurrent,
  onScanningChange,
  uploading = false,
  disabled = false,
  className,
}: ImageUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const scanToken = useRef(0)
  const [scanningFile, setScanningFile] = useState<File | null>(null)
  const guardRef = useRef<HTMLInputElement>(null)
  const [rejectedFile, setRejectedFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const busyFile = scanningFile ?? (uploading ? value : null)
  const locked = disabled || Boolean(busyFile)
  const guardMessage = scanningFile ? SCANNING_MESSAGE : error ? `${error} Remove or replace the image to continue.` : ""

  useEffect(() => {
    guardRef.current?.setCustomValidity(guardMessage)
  }, [guardMessage])

  function finishScan(token: number) {
    if (token !== scanToken.current) return
    setScanningFile(null)
    onScanningChange?.(false)
  }

  function handleFile(selected: File | undefined) {
    if (!selected) return

    const token = scanToken.current + 1
    scanToken.current = token
    setError("")
    setRejectedFile(null)

    const file = normalizeImageFile(selected)

    if (!file) {
      setRejectedFile(selected)
      setError("Only PNG, JPG, WEBP or HEIC images are allowed.")
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setRejectedFile(file)
      setError(`Maximum file size is 5 MB. The selected file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`)
      return
    }

    setScanningFile(file)
    onScanningChange?.(true)

    const data = new FormData()
    data.append("image", file)

    api
      .post<Blob>("/v1/images/scan", data, { responseType: "blob" })
      .then((response) => {
        if (token !== scanToken.current) return
        onChange(new File([response.data], toWebpName(file.name), { type: "image/webp" }))
        finishScan(token)
      })
      .catch(async (scanError: unknown) => {
        const message = await imageErrorMessage(scanError, "The image could not be verified. Please try again.")
        if (token !== scanToken.current) return
        setRejectedFile(file)
        setError(message)
        finishScan(token)
      })
  }

  function handleRemove() {
    setError("")
    if (rejectedFile) return setRejectedFile(null)
    if (value) onChange(null)
    else onRemoveCurrent?.()
  }

  const canRemove = Boolean(rejectedFile) || Boolean(value) || Boolean(onRemoveCurrent)

  return (
    <Field data-invalid={Boolean(error)} className={className}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>

      {busyFile ? (
        <Attachment state="uploading" className="w-full max-w-sm">
          <AttachmentMedia>
            <Spinner />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{busyFile.name}</AttachmentTitle>
            <AttachmentDescription>
              {scanningFile ? "Scanning" : "Uploading"} · {describeImage(busyFile)}
            </AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ) : rejectedFile ? (
        <Attachment state="error" className="w-full max-w-sm">
          <AttachmentMedia>
            <ImageOff />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{rejectedFile.name}</AttachmentTitle>
            <AttachmentDescription>Rejected by security scan</AttachmentDescription>
          </AttachmentContent>
          {!disabled && (
            <AttachmentActions>
              <AttachmentAction variant="secondary" aria-label={`Replace ${label.toLowerCase()}`} onClick={() => inputRef.current?.click()}>
                <RefreshCw />
              </AttachmentAction>
              <AttachmentAction variant="secondary" aria-label={`Remove ${label.toLowerCase()}`} onClick={handleRemove}>
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          )}
        </Attachment>
      ) : value || currentUrl ? (
        <Attachment orientation="vertical">
          <AttachmentMedia variant="image">
            {value ? <FilePreview file={value} /> : <img src={currentUrl ?? undefined} alt={label} />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{value ? value.name : "Current image"}</AttachmentTitle>
            <AttachmentDescription>{value ? describeImage(value) : "Saved image"}</AttachmentDescription>
          </AttachmentContent>
          {!disabled && (
            <AttachmentActions>
              <AttachmentAction variant="secondary" aria-label={`Replace ${label.toLowerCase()}`} onClick={() => inputRef.current?.click()}>
                <RefreshCw />
              </AttachmentAction>
              {canRemove && (
                <AttachmentAction variant="secondary" aria-label={`Remove ${label.toLowerCase()}`} onClick={handleRemove}>
                  <XIcon />
                </AttachmentAction>
              )}
            </AttachmentActions>
          )}
        </Attachment>
      ) : (
        <label
          htmlFor={inputId}
          aria-disabled={disabled}
          className="flex min-h-10 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 transition hover:border-primary hover:bg-muted/40 aria-disabled:pointer-events-none aria-disabled:opacity-60"
        >
          <ImagePlus className="mb-2 size-10 text-muted-foreground" />
          <span className="text-sm font-medium">Click to upload {label.toLowerCase()}</span>
          <span className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP or HEIC</span>
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        disabled={locked}
        onChange={(event) => {
          handleFile(event.target.files?.[0])
          event.target.value = ""
        }}
      />

      <input
        ref={guardRef}
        data-image-guard
        {...{ [LIVE_INVALID_ATTR]: String(Boolean(guardMessage)) }}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />

      <FieldDescription>Optional. PNG, JPG, WEBP or HEIC, maximum 5 MB. Saved as WEBP after a security scan.</FieldDescription>

      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

ImageUpload.validate = blockInvalidImage
