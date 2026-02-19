"use client"

import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Algorithm } from "@/core/algorithms"
import { ReputoForm } from "@/core/reputo-form"
import { buildSchemaFromAlgorithm } from "@/core/schema-builder"
import type { CreateAlgorithmPresetDto } from "@/lib/api/types"

interface CreatePresetDialogProps {
  algo?: Algorithm
  onCreatePreset: (data: CreateAlgorithmPresetDto) => Promise<void>
  isLoading: boolean
}

interface BackendError {
  statusCode?: number
  message?:
    | {
        message?: string[]
        error?: string
        statusCode?: number
      }
    | string
}

/**
 * Parse backend error response to extract error messages
 */
function parseBackendErrorMessages(error: unknown): string[] {
  const messages: string[] = []

  if (!error || typeof error !== "object") {
    return messages
  }

  const backendError = error as BackendError

  // Handle nested message structure
  if (backendError.message) {
    if (typeof backendError.message === "string") {
      messages.push(backendError.message)
    } else if (
      typeof backendError.message === "object" &&
      backendError.message.message
    ) {
      const messageArray = Array.isArray(backendError.message.message)
        ? backendError.message.message
        : [backendError.message.message]

      messageArray.forEach((msg) => {
        if (typeof msg === "string") {
          messages.push(msg)
        }
      })
    }
  }

  return messages
}

/** Normalize numeric value: "1,2" (locale) → number 1.2 for API validity. */
function normalizeNumericPresetValue(value: unknown): unknown {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  if (trimmed === "") return value
  const n = Number(trimmed.replace(/,/g, "."))
  return Number.isFinite(n) ? n : value
}

const NUMERIC_INPUT_TYPES = new Set(["number", "integer", "slider"])

export function CreatePresetDialog({
  algo,
  onCreatePreset,
  isLoading,
}: CreatePresetDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Generate schema from algorithm
  const schema = useMemo(() => {
    if (!algo) return null
    return buildSchemaFromAlgorithm(algo, "1.0.0")
  }, [algo])

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!algo) return

    try {
      // Transform form data to CreateAlgorithmPresetDto format.
      // Form schema uses algorithm input keys as field names, so resolve by input.key only.
      const createData: CreateAlgorithmPresetDto = {
        key: (data.key as string) || algo.id,
        version: (data.version as string) || "1.0.0",
        name: data.name as string | undefined,
        description: data.description as string | undefined,
        inputs: algo.inputs.map((input) => {
          const value = data[input.key]

          let inputValue: unknown
          if (value instanceof File) {
            inputValue = ""
          } else {
            const raw = value !== undefined && value !== null ? value : ""
            inputValue =
              NUMERIC_INPUT_TYPES.has(input.type) && raw !== ""
                ? normalizeNumericPresetValue(raw)
                : raw
          }

          return { key: input.key, value: inputValue }
        }),
      }

      await onCreatePreset(createData)

      // Close dialog on success
      setIsOpen(false)
      toast.success("Preset created successfully")
    } catch (err) {
      // Show errors as toasts instead of in-modal alerts
      const errorMessages = parseBackendErrorMessages(err)
      if (errorMessages.length > 0) {
        errorMessages.forEach((msg) => {
          toast.error(msg)
        })
      } else {
        toast.error("Failed to create preset. Please try again.")
      }
    }
  }

  if (!algo || !schema) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" /> Create New Preset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle>Create New Preset</DialogTitle>
          <DialogDescription>
            Configure the inputs for {algo.title}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <ReputoForm
            schema={schema}
            onSubmit={handleSubmit}
            submitLabel="Create Preset"
            defaultValues={{
              key: algo.id,
              version: "1.0.0",
            }}
            hiddenFields={["key", "version"]}
            compact
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
