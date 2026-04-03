"use client"

import Link from "next/link"
import { UserMenu } from "@/components/app/user-menu"

export function DashboardHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" className="text-lg font-semibold">
          Reputo
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}
