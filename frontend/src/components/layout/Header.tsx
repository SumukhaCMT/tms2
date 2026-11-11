
import {
  LogOut,
  Search,
  User,
} from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import OrderNotifications from "@/components/layout/OrderNotifications"
import { useAuth } from "@/features/auth/useAuth"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import {
  Avatar,
  AvatarFallback,
  
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b bg-background px-4">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        <SidebarTrigger />

        <div className="hidden h-6 w-px bg-border md:block" />

        <div className="flex flex-col">
          <h1 className="text-sm font-semibold md:text-base">
            Namaste, {user?.name}
          </h1>

          <span className="hidden text-xs text-muted-foreground md:block">
            {user?.user_role_name ?? user?.user_type}
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

        {user?.is_internal && <OrderNotifications />}

        {/* PROFILE */}
        <div className="ml-1 flex items-center gap-2 border-l pl-3">

          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-8">
                <AvatarFallback>
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{user?.name}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={logout}>
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

