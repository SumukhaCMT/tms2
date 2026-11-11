import { Suspense } from "react"
import { Link, Outlet } from "react-router-dom"
import { Landmark, Loader2 } from "lucide-react"

import defaultLoginImage from "@/assets/gopura-3.png"
import { useLoginImage } from "@/features/setting/useLoginImage"

export default function AuthLayout() {
  const loginImage = useLoginImage()

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="hidden p-4 lg:flex lg:items-center lg:justify-center">
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          {loginImage !== undefined && (
            <img
              src={loginImage ?? defaultLoginImage}
              alt="Temple"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/login" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Landmark className="size-4" />
            </div>
            TMS Software
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <Suspense fallback={<Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
