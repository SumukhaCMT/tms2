import { useEffect, useState } from "react"

import api from "@/axios/axios"
import { showCmtToast } from "@/components/ui/cmt-toast"
import { UserDetailsView } from "@/features/users/viewUser"
import { apiMessage, type UserActivity, type UserProfile } from "@/features/users/usersTypes"

export default function Profile() {
  const [profile, setProfile] = useState<{ user: UserProfile; activity: UserActivity } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/v1/org-users/me")
      .then((res) => setProfile(res.data.data))
      .catch((error) => showCmtToast("expiry", apiMessage(error, "Failed to load your profile. Please try again.")))
      .finally(() => setLoading(false))
  }, [])

  return <UserDetailsView user={profile?.user ?? null} activity={profile?.activity ?? null} isLoading={loading} />
}
