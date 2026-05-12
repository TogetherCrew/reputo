"use client"

import { AddAdminForm } from "@/components/admins/add-admin-form"
import { AdminsTable } from "@/components/admins/admins-table"
import { RoleGate } from "@/components/admins/role-gate"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAdmins } from "@/lib/api/hooks"

function AdminsPageContent() {
  const adminsQuery = useAdmins()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Admins</h1>
        <p className="text-muted-foreground text-sm">
          Manage who can sign in and administer Reputo. The owner row cannot be
          removed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite an administrator</CardTitle>
          <CardDescription>
            New admins gain access the next time they sign in with DeepID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddAdminForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current admins</CardTitle>
          <CardDescription>
            The owner is listed first; remove an admin to revoke their session
            immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminsTable
            data={adminsQuery.data}
            isLoading={adminsQuery.isLoading}
            isError={adminsQuery.isError}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminsPage() {
  return (
    <RoleGate requiredRole="owner">
      <AdminsPageContent />
    </RoleGate>
  )
}
