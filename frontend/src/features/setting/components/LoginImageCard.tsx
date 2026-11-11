import { useState } from "react"
import { Save } from "lucide-react"

import defaultLoginImage from "@/assets/gopura-3.png"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { usePermission } from "@/permissions/usePermission"
import { imageErrorMessage, saveEntityImage } from "@/utils/imageUpload"

import { LOGIN_IMAGE_API, useLoginImage } from "../useLoginImage"

export default function LoginImageCard() {
  const canEdit = usePermission("settings", "EDIT")
  const [version, setVersion] = useState(0)
  const customUrl = useLoginImage(version)
  const [file, setFile] = useState<File | null>(null)
  const [removed, setRemoved] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)

  const hasCustom = Boolean(customUrl) && !removed
  const currentUrl = customUrl === undefined ? null : hasCustom ? customUrl : defaultLoginImage

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveEntityImage(LOGIN_IMAGE_API, { file, removed })
      showCmtToast("success", file ? "Login image updated successfully." : "Login image reset to default.")
      setFile(null)
      setRemoved(false)
      setVersion((value) => value + 1)
    } catch (error) {
      showCmtToast("expiry", await imageErrorMessage(error, "Failed to save login image."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Remove it to use the default image.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUpload
          label="Login Image"
          className="max-w-sm"
          value={file}
          onChange={setFile}
          currentUrl={currentUrl}
          onRemoveCurrent={hasCustom ? () => setRemoved(true) : undefined}
          onScanningChange={setScanning}
          uploading={saving}
          disabled={!canEdit || saving}
        />
        {canEdit && (
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave} disabled={saving || scanning || (!file && !removed)}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
