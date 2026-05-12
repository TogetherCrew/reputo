"use client"

import { Loader2, UserPlus } from "lucide-react"
import { useId, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  describeAdminEmailError,
  validateAdminEmail,
} from "@/lib/admins/validate-email"
import { useAddAdmin } from "@/lib/api/hooks"
import { extractApiStatus } from "@/lib/api/status"

export function AddAdminForm() {
  const inputId = useId()
  const [email, setEmail] = useState("")
  const [clientError, setClientError] = useState<string | null>(null)
  const addAdmin = useAddAdmin()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = validateAdminEmail(email)
    if (!result.ok) {
      setClientError(describeAdminEmailError(result.reason))
      return
    }
    setClientError(null)

    try {
      await addAdmin.mutateAsync(result.email)
      toast.success(`${result.email} added to admins.`)
      setEmail("")
    } catch (error) {
      const status = extractApiStatus(error)
      if (status === 409) {
        toast.error(`${result.email} is already an admin.`)
      } else if (status === 400) {
        toast.error("That email isn't valid.")
      } else if (status === 403) {
        toast.error("You don't have permission to add admins.")
      } else {
        toast.error("Failed to add admin. Please try again.")
      }
    }
  }

  const isPending = addAdmin.isPending

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Label htmlFor={inputId} className="text-sm font-medium">
          Add an admin
        </Label>
        <Input
          id={inputId}
          type="email"
          autoComplete="off"
          inputMode="email"
          placeholder="name@example.com"
          required
          value={email}
          aria-invalid={clientError ? true : undefined}
          aria-describedby={clientError ? `${inputId}-error` : undefined}
          disabled={isPending}
          onChange={(event) => {
            setEmail(event.target.value)
            if (clientError) setClientError(null)
          }}
          className="mt-1"
        />
        {clientError ? (
          <p
            id={`${inputId}-error`}
            className="text-destructive mt-1 text-xs"
            role="alert"
          >
            {clientError}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
        ) : (
          <UserPlus className="mr-2 size-4" aria-hidden="true" />
        )}
        {isPending ? "Adding…" : "Add admin"}
      </Button>
    </form>
  )
}
