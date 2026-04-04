"use client"

import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthSession } from "@/lib/auth/auth-context"

function getDisplayName(user: {
  username?: string
  email?: string
  sub: string
}): string {
  if (user.username) return user.username
  if (user.email) return user.email
  return user.sub
}

function getInitials(user: {
  username?: string
  email?: string
  sub: string
}): string {
  if (user.username) return user.username[0].toUpperCase()
  if (user.email) return user.email[0].toUpperCase()
  return user.sub[0]?.toUpperCase() ?? "U"
}

export function UserMenu() {
  const { session, loading, logout } = useAuthSession()

  if (loading || !session?.user) {
    return <Skeleton className="size-8 rounded-full" />
  }

  const user = session.user
  const displayName = getDisplayName(user)
  const initials = getInitials(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar>
          {user.picture && <AvatarImage src={user.picture} alt={displayName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
