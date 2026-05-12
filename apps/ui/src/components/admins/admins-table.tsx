"use client"

import { ShieldCheck } from "lucide-react"
import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { sortAdmins } from "@/lib/admins/sort-admins"
import type { AdminViewDto } from "@/lib/api/types"
import { RemoveAdminButton } from "./remove-admin-button"

interface AdminsTableProps {
  data: AdminViewDto[] | undefined
  isLoading: boolean
  isError: boolean
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2].map((row) => (
        <TableRow key={row}>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-14" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="ml-auto h-8 w-8 rounded" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function AdminsTable({ data, isLoading, isError }: AdminsTableProps) {
  const rows = useMemo(() => (data ? sortAdmins(data) : []), [data])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Invited</TableHead>
          <TableHead>Invited by</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-muted-foreground py-8 text-center"
            >
              Failed to load admins. Please refresh and try again.
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-muted-foreground py-8 text-center"
            >
              No admins yet.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.email}>
              <TableCell className="font-medium">{row.email}</TableCell>
              <TableCell>
                {row.role === "owner" ? (
                  <Badge variant="default" className="gap-1">
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    Owner
                  </Badge>
                ) : (
                  <Badge variant="secondary">Admin</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(row.invitedAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.invitedByEmail ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                {row.role === "owner" ? (
                  <span className="text-muted-foreground text-xs">
                    Read-only
                  </span>
                ) : (
                  <RemoveAdminButton email={row.email} />
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
