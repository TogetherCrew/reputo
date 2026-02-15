"use client"

import {
  type AlgorithmDefinition,
  getAlgorithmDefinition,
} from "@reputo/reputation-algorithms"
import { AlertCircle } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAlgorithmById } from "@/core/algorithms"
import { ReputoForm } from "@/core/reputo-form"
import { buildSchemaFromAlgorithm } from "@/core/schema-builder"
import type {
  AlgorithmPresetResponseDto,
  UpdateAlgorithmPresetDto,
} from "@/lib/api/types"

interface EditPresetDialogProps {
  isOpen: boolean
  onClose: () => void
  preset: AlgorithmPresetResponseDto | null
  onUpdatePreset: (data: UpdateAlgorithmPresetDto) => Promise<void>
  isLoading: boolean
  error?: unknown
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
 * Parse backend error response to extract field errors
 */
function parseBackendError(
  error: unknown
): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = []

  if (!error || typeof error !== "object") {
    return errors
  }

  const backendError = error as BackendError

  // Handle nested message structure
  if (backendError.message) {
    if (typeof backendError.message === "string") {
      errors.push({ field: "_general", message: backendError.message })
    } else if (
      typeof backendError.message === "object" &&
      backendError.message.message
    ) {
      const messageArray = Array.isArray(backendError.message.message)
        ? backendError.message.message
        : [backendError.message.message]

      messageArray.forEach((msg) => {
        if (typeof msg === "string") {
          // Try to extract field name from error message
          // Format: "fieldName must be..."
          const fieldMatch = msg.match(/^(\w+)\s+/)
          const field = fieldMatch ? fieldMatch[1] : "_general"
          errors.push({ field, message: msg })
        }
      })
    }
  }

  return errors
}

export function EditPresetDialog({
  isOpen,
  onClose,
  preset,
  onUpdatePreset,
  isLoading,
  error: backendError,
}: EditPresetDialogProps) {
  const [formErrors, setFormErrors] = useState<
    { field: string; message: string }[]
  >([])
  const isSubmittingRef = useRef(false)

  // Get algorithm from preset
  const algorithm = useMemo(() => {
    if (!preset) return null
    return getAlgorithmById(preset.key)
  }, [preset])

  // Generate schema from algorithm
  const schema = useMemo(() => {
    if (!algorithm) return null
    return buildSchemaFromAlgorithm(algorithm, preset?.version || "1.0.0")
  }, [algorithm, preset])

  // Fetch full algorithm definition to get original input keys
  const fullDefinition = useMemo(() => {
    if (!preset) return null
    try {
      const definitionJson = getAlgorithmDefinition({ key: preset.key })
      return JSON.parse(definitionJson) as AlgorithmDefinition
    } catch (error) {
      console.warn(`Could not fetch full definition for ${preset.key}:`, error)
      return null
    }
  }, [preset])

  // Build default values from preset
  const defaultValues = useMemo(() => {
    if (!preset || !algorithm) return {}

    const defaults: Record<string, unknown> = {
      key: preset.key,
      version: preset.version,
      name: preset.name || "",
      description: preset.description || "",
    }

    // Map preset inputs to form field values.
    // The form schema uses algorithm input keys (e.g. "votes") directly.
    preset.inputs.forEach((presetInput) => {
      // Normal path: preset keys should match algorithm input keys.
      defaults[presetInput.key] = presetInput.value

      // Backwards compatibility fallback: if preset used label-derived keys, try mapping.
      if (
        defaults[presetInput.key] == null ||
        defaults[presetInput.key] === ""
      ) {
        const fullDefInput = fullDefinition?.inputs.find(
          (input) =>
            input.label &&
            input.label.toLowerCase().replace(/\s+/g, "_") === presetInput.key
        )
        if (fullDefInput?.key) {
          defaults[fullDefInput.key] = presetInput.value
        }
      }
    })

    return defaults
  }, [preset, algorithm, fullDefinition])

  // Parse backend errors
  const backendErrors = useMemo(() => {
    if (!backendError) return []
    return parseBackendError(backendError)
  }, [backendError])

  // Combine form errors and backend errors
  const allErrors = [...formErrors, ...backendErrors]

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!preset || !algorithm) return
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setFormErrors([])

    try {
      // Build PATCH payload: only include defined fields (API accepts partial update)
      const updateData: UpdateAlgorithmPresetDto = {}

      if (data.name !== undefined && data.name !== "") {
        updateData.name = data.name as string
      }
      if (data.description !== undefined && data.description !== "") {
        updateData.description = data.description as string
      }

      // Inputs: send full array from form so backend can replace; use preset value when form has no value
      const inputs = algorithm.inputs.map((input, index) => {
        const value = data[input.key]
        const originalKey =
          fullDefinition?.inputs.find(
            (defInput) => defInput.label === input.label
          )?.key ||
          fullDefinition?.inputs[index]?.key ||
          input.key
        let inputValue: unknown
        if (value instanceof File) {
          inputValue = ""
        } else if (value !== undefined && value !== null && value !== "") {
          inputValue = value
        } else {
          const existing = preset.inputs.find((i) => i.key === originalKey)
          inputValue = existing?.value ?? ""
        }
        return { key: originalKey, value: inputValue }
      })
      updateData.inputs = inputs

      await onUpdatePreset(updateData)
      onClose()
    } catch (err) {
      const parsedErrors = parseBackendError(err)
      setFormErrors(parsedErrors)
    } finally {
      isSubmittingRef.current = false
    }
  }

  const handleClose = () => {
    setFormErrors([])
    onClose()
  }

  if (!preset || !algorithm || !schema) {
    return null
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Preset</DialogTitle>
          <DialogDescription>
            Update your preset name, description, and input files for{" "}
            {algorithm.title}.
          </DialogDescription>
        </DialogHeader>

        {/* Display general errors */}
        {allErrors.filter((e) => e.field === "_general").length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {allErrors
                .filter((e) => e.field === "_general")
                .map((e) => (
                  <div key={e.message}>{e.message}</div>
                ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Dynamic form - key forces re-mount when preset changes */}
        <ReputoForm
          key={preset._id}
          schema={schema}
          onSubmit={handleSubmit}
          submitLabel="Update Preset"
          defaultValues={defaultValues}
          hiddenFields={["key", "version"]}
          className="mt-4"
        />
      </DialogContent>
    </Dialog>
  )
}
