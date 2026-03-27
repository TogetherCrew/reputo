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
import { cn } from "@/lib/utils"
import { validateAlgorithmPresetClient } from "./algorithm-client-validation"
import { extractApiErrorMessages } from "./error-utils"

interface CreatePresetDialogProps {
  algo?: Algorithm
  onCreatePreset: (data: CreateAlgorithmPresetDto) => Promise<void>
  isLoading: boolean
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

  const hasResourceSelector = useMemo(
    () =>
      schema?.inputs.some(
        (input) =>
          input.type === "array" && input.widget === "resource_selector"
      ) ?? false,
    [schema]
  )

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
          } else if (input.type === "array" && Array.isArray(value)) {
            inputValue = value
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

      const clientErrors = await validateAlgorithmPresetClient({
        key: createData.key,
        version: createData.version,
        inputs: createData.inputs,
        name: createData.name,
        description: createData.description,
      })

      if (clientErrors.length > 0) {
        clientErrors.forEach((error) => {
          toast.error(error.message)
        })
        return
      }

      await onCreatePreset(createData)

      // Close dialog on success
      setIsOpen(false)
      toast.success("Preset created successfully")
    } catch (err) {
      // Show errors as toasts instead of in-modal alerts
      const errorMessages = extractApiErrorMessages(err)
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
      <DialogContent
        className={cn(
          "max-h-[90vh] flex flex-col p-0",
          hasResourceSelector ? "sm:max-w-5xl" : "sm:max-w-lg"
        )}
      >
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
