"use client"

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
import { validateAlgorithmPresetClient } from "./algorithm-client-validation"
import { extractApiFieldErrors } from "./error-utils"

interface EditPresetDialogProps {
  isOpen: boolean
  onClose: () => void
  preset: AlgorithmPresetResponseDto | null
  onUpdatePreset: (data: UpdateAlgorithmPresetDto) => Promise<void>
  isLoading: boolean
  error?: unknown
}

/** Normalize numeric value: accept "1,2" (locale) and return number 1.2 so UI and API use dot. */
function normalizeNumericPresetValue(value: unknown): unknown {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  if (trimmed === "") return value
  const normalized = trimmed.replace(/,/g, ".")
  const n = Number(normalized)
  return Number.isFinite(n) ? n : value
}

const NUMERIC_INPUT_TYPES = new Set(["number", "integer", "slider"])

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

  // Build default values from preset (preset.inputs use algorithm input keys)
  const defaultValues = useMemo(() => {
    if (!preset || !algorithm) return {}

    const defaults: Record<string, unknown> = {
      key: preset.key,
      version: preset.version,
      name: preset.name || "",
      description: preset.description || "",
    }

    preset.inputs.forEach((presetInput) => {
      const raw = presetInput.value
      const algoInput = algorithm.inputs.find((i) => i.key === presetInput.key)
      if (algoInput?.type === "array" && Array.isArray(raw)) {
        defaults[presetInput.key] = raw
      } else {
        const isNumeric = algoInput && NUMERIC_INPUT_TYPES.has(algoInput.type)
        defaults[presetInput.key] = isNumeric
          ? normalizeNumericPresetValue(raw)
          : raw
      }
    })

    return defaults
  }, [preset, algorithm])

  // Parse backend errors
  const backendErrors = useMemo(() => {
    if (!backendError) return []
    return extractApiFieldErrors(backendError)
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

      // Inputs: use algorithm input keys; send form value or fall back to existing preset value.
      // Normalize numeric values so "1,2" (locale) is sent as number 1.2 for API validity.
      const inputs = algorithm.inputs.map((input) => {
        const value = data[input.key]
        let inputValue: unknown
        if (value instanceof File) {
          inputValue = ""
        } else if (input.type === "array" && Array.isArray(value)) {
          inputValue = value
        } else if (value !== undefined && value !== null && value !== "") {
          inputValue = NUMERIC_INPUT_TYPES.has(input.type)
            ? normalizeNumericPresetValue(value)
            : value
        } else {
          const existing = preset.inputs.find((i) => i.key === input.key)
          const raw = existing?.value ?? ""
          inputValue = NUMERIC_INPUT_TYPES.has(input.type)
            ? normalizeNumericPresetValue(raw)
            : raw
        }
        return { key: input.key, value: inputValue }
      })
      updateData.inputs = inputs

      const clientErrors = await validateAlgorithmPresetClient({
        key: preset.key,
        inputs,
      })

      if (clientErrors.length > 0) {
        setFormErrors(clientErrors)
        return
      }

      await onUpdatePreset(updateData)
      onClose()
    } catch (err) {
      const parsedErrors = extractApiFieldErrors(err)
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

        {/* Display submit errors */}
        {allErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {allErrors.map((e) => (
                <div key={`${e.field}:${e.message}`}>
                  {e.field !== "_general"
                    ? `${e.field}: ${e.message}`
                    : e.message}
                </div>
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
