"use client"

import { Loader2, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useRemoveAdmin } from "@/lib/api/hooks"
import { extractApiStatus } from "@/lib/api/status"

interface RemoveAdminButtonProps {
  email: string
}

export function RemoveAdminButton({ email }: RemoveAdminButtonProps) {
  const [open, setOpen] = useState(false)
  const removeAdmin = useRemoveAdmin()

  const handleConfirm = async (event: React.MouseEvent) => {
    event.preventDefault()
    try {
      await removeAdmin.mutateAsync(email)
      toast.success(`Removed ${email}.`)
      setOpen(false)
    } catch (error) {
      const status = extractApiStatus(error)
      if (status === 403) {
        toast.error("You don't have permission to remove admins.")
      } else if (status === 404) {
        toast.error(`${email} is no longer in the admin list.`)
      } else {
        toast.error("Failed to remove admin. Please try again.")
      }
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Remove ${email}`}
          disabled={removeAdmin.isPending}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {removeAdmin.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-4" aria-hidden="true" />
          )}
          <span className="sr-only">Remove {email}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {email}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will sign them out immediately. Continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeAdmin.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={removeAdmin.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {removeAdmin.isPending ? "Removing…" : "Remove admin"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
