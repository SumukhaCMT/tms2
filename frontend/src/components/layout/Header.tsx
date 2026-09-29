
import {
  Bell,
  Search,
  User,
} from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import {
  Avatar,
  AvatarFallback,
  
} from "@/components/ui/avatar"

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b bg-background px-4">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        <SidebarTrigger />

        <div className="hidden h-6 w-px bg-border md:block" />

        <div className="flex flex-col">
          <h1 className="text-sm font-semibold md:text-base">
           Login User Name
          </h1>

          <span className="hidden text-xs text-muted-foreground md:block">
             Role of login user Administrator
          </span>
        </div>

      </div>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-2">

        {/* SEARCH */}
        {/* <div className="relative hidden md:block">
          <Search
            className="
              absolute
              left-3
              top-1/2
              size-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <Input
            type="search"
            placeholder="Search..."
            className="w-56 pl-9 lg:w-72"
          />
        </div> */}

        {/* MOBILE SEARCH */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Search />
        </Button>

        {/* NOTIFICATION */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell />

          {/* Notification badge */}
          <span
            className="
              absolute
              right-1
              top-1
              flex
              size-2
              rounded-full
              bg-red-500
            "
          />
        </Button>

        {/* PROFILE */}
        <div className="ml-1 flex items-center gap-2 border-l pl-3">

          <Avatar className="size-8">
            <AvatarFallback>
              <User className="size-4" />
              
            </AvatarFallback>
          
          </Avatar>

          {/* <div className="hidden flex-col lg:flex">
            <span className="text-sm font-medium">
              Admin Name
            </span>

            <span className="text-xs text-muted-foreground">
              Administrator
            </span>
          </div> */}

        </div>

      </div>

    </header>
  )
}

