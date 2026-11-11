import { useEffect, useState } from "react"

import api from "@/axios/axios"

export function useImageUrl(path: string | null) {
  const [image, setImage] = useState<{ path: string; url: string } | null>(null)

  useEffect(() => {
    if (!path) return

    let active = true
    let url: string | null = null

    api
      .get<Blob>(path, { responseType: "blob" })
      .then((response) => {
        if (!active) return
        url = URL.createObjectURL(response.data)
        setImage({ path, url })
      })
      .catch(() => undefined)

    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [path])

  return image && image.path === path ? image.url : null
}
