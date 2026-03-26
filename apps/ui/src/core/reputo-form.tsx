"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { buildZodSchema } from "@reputo/algorithm-validator"
import type { AlgorithmDefinition } from "@reputo/reputation-algorithms"
import { useForm, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  BooleanField,
  CSVField,
  DateField,
  EnumField,
  JSONField,
  NumberField,
  RepeaterField,
  SelectField,
  SliderField,
  TextField,
} from "./fields"
import { FormUploadProvider, useFormUpload } from "./form-context"
import type { FormInput, FormSchema } from "./schema-builder"

interface ReputoFormProps {
  schema: FormSchema | AlgorithmDefinition
  onSubmit: (data: any) => void | Promise<void>
  defaultValues?: Record<string, any>
  submitLabel?: string
  clientValidate?: boolean
  showResetButton?: boolean
  className?: string
  hiddenFields?: string[] // Field keys to hide from UI but keep in validation
  compact?: boolean // Use compact vertical spacing
}

export function ReputoForm(props: ReputoFormProps) {
  return (
    <FormUploadProvider>
      <ReputoFormInner {...props} />
    </FormUploadProvider>
  )
}

function ReputoFormInner({
  schema,
  onSubmit,
  defaultValues = {},
  submitLabel = "Submit",
  clientValidate = true,
  showResetButton = false,
  className = "",
  hiddenFields = [],
  compact = false,
}: ReputoFormProps) {
  // Build Zod schema from AlgorithmDefinition (if it has the right structure)
  const zodSchema =
    clientValidate && "inputs" in schema && "outputs" in schema
      ? buildZodSchema(schema as AlgorithmDefinition)
      : null

  // Initialize form with react-hook-form
  const form = useForm({
    resolver:
      clientValidate && zodSchema ? zodResolver(zodSchema as any) : undefined,
    defaultValues: getDefaultValues(schema, defaultValues),
    mode: "onChange", // Validate on change for real-time validity
    reValidateMode: "onChange",
  })

  // Get upload state from context
  const { isUploading } = useFormUpload()

  // Watch all values to trigger re-validation
  const watchedValues = useWatch({ control: form.control })

  // Render appropriate field component based on input type
  const renderField = (input: FormInput | any) => {
    const commonProps = {
      input: input as any,
      control: form.control,
    }

    switch (input.type) {
      case "text":
        return <TextField key={input.key} {...commonProps} />
      case "number":
      case "integer":
        return <NumberField key={input.key} {...commonProps} />
      case "boolean":
        return <BooleanField key={input.key} {...commonProps} />
      case "enum":
        return <EnumField key={input.key} {...commonProps} />
      case "select":
        return <SelectField key={input.key} {...commonProps} />
      case "slider":
        return <SliderField key={input.key} {...commonProps} />
      case "csv":
        return <CSVField key={input.key} {...commonProps} />
      case "json":
        return <JSONField key={input.key} {...commonProps} />
      case "date":
        return <DateField key={input.key} {...commonProps} />
      case "array":
        return <RepeaterField key={input.key} {...commonProps} />
      default:
        return null
    }
  }

  // Filter out hidden fields from rendering
  const visibleInputs = schema.inputs.filter(
    (input) => !hiddenFields.includes(input.key)
  )

  const hasAllRequiredValues = schema.inputs
    .filter((input) => {
      const required = "required" in input ? input.required !== false : true
      return required
    })
    .every((input) => {
      const value = watchedValues?.[input.key]
      if (value === undefined || value === null || value === "") {
        return false
      }
      if (
        (input.type === "csv" || input.type === "json") &&
        value instanceof File
      ) {
        return false
      }
      if (input.type === "array" && Array.isArray(value)) {
        return value.length >= ((input as any).minItems ?? 1)
      }
      return true
    })

  // Determine if submit should be disabled
  const isSubmitDisabled =
    form.formState.isSubmitting ||
    isUploading ||
    !form.formState.isValid ||
    !hasAllRequiredValues ||
    Object.keys(form.formState.errors).length > 0

  return (
    <div className={className}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={compact ? "space-y-4" : "space-y-6"}
        >
          {visibleInputs.map((input) => renderField(input))}

          <div className="flex justify-end gap-2 pt-4">
            {showResetButton && (
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
            )}
            <Button type="submit" disabled={isSubmitDisabled}>
              {form.formState.isSubmitting
                ? "Submitting..."
                : isUploading
                  ? "Uploading..."
                  : submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

/**
 * Gets default values for form fields based on schema
 */
function getDefaultValues(
  schema: FormSchema | AlgorithmDefinition,
  userDefaults: Record<string, any>
): Record<string, any> {
  const defaults: Record<string, any> = {}

  const isNumericType = (type: unknown) =>
    type === "number" || type === "integer" || type === "slider"

  const normalizeNumeric = (value: unknown): unknown => {
    if (typeof value !== "string") return value
    const trimmed = value.trim()
    if (trimmed === "") return ""
    const normalized = trimmed.replace(",", ".")
    const n = Number(normalized)
    return Number.isFinite(n) ? n : value
  }

  schema.inputs.forEach((input) => {
    if (userDefaults[input.key] !== undefined) {
      const raw = userDefaults[input.key]
      defaults[input.key] = isNumericType(input.type)
        ? normalizeNumeric(raw)
        : raw
    } else if ("default" in input && input.default !== undefined) {
      defaults[input.key] = isNumericType(input.type)
        ? normalizeNumeric(input.default)
        : input.default
    } else {
      const isRequired = "required" in input ? input.required !== false : true
      switch (input.type) {
        case "boolean":
          defaults[input.key] = false
          break
        case "number":
        case "integer":
        case "slider":
          defaults[input.key] = ""
          break
        case "array": {
          const itemProps = (input as any).itemProperties as
            | Array<{ key: string; default?: unknown }>
            | undefined
          const defaultRow: Record<string, unknown> = {}
          if (itemProps) {
            for (const prop of itemProps) {
              defaultRow[prop.key] = prop.default ?? ""
            }
          }
          const minItems = (input as any).minItems ?? 1
          defaults[input.key] = Array.from({ length: minItems }, () => ({
            ...defaultRow,
          }))
          break
        }
        case "text":
        case "enum":
        case "select":
        case "date":
        case "csv":
        case "json":
          if (!isRequired) {
            defaults[input.key] = undefined
          } else {
            defaults[input.key] = ""
          }
          break
      }
    }
  })

  return defaults
}
