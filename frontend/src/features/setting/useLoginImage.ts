import { useEffect, useState } from "react"

import api from "@/axios/axios"

export const LOGIN_IMAGE_API = "/v1/system-defaults/login-image"

export function useLoginImage(version = 0) {
  const [url, setUrl] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    api
      .get<Blob>(LOGIN_IMAGE_API, { responseType: "blob" })
      .then(({ data }) => {
        if (!active) return
        objectUrl = URL.createObjectURL(data)
        setUrl(objectUrl)
      })
      .catch(() => {
        if (active) setUrl(null)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [version])

  return url
}
