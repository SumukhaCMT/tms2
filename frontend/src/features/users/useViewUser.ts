import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"

import { apiMessage, type UserActivity, type UserProfile } from "./usersTypes"

export function useViewUser() {
  const { id } = useParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [activity, setActivity] = useState<UserActivity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get(`/v1/org-users/${id}`), api.get(`/v1/org-users/${id}/activity`)])
      .then(([userRes, activityRes]) => {
        setUser(userRes.data.data)
        setActivity(activityRes.data.data)
      })
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to load user details. Please try again.")))
      .finally(() => setLoading(false))
  }, [id])

  return { id, user, activity, loading }
}
