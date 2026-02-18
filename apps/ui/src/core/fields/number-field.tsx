"use client"

import { useEffect, useRef, useState } from "react"
import type { Control } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { FormInput } from "../schema-builder"

interface NumberFieldProps {
  input: FormInput
  control: Control<any>
}

/** Format numeric value for display so decimal separator is always dot (avoids locale "1,2"). */
function toDisplayValue(value: unknown): string {
  if (value === "" || value === undefined || value === null) return ""
  const n = Number(value)
  return Number.isNaN(n) ? "" : String(n)
}

/** Parse input string (accepts both comma and dot as decimal separator) to number. */
function fromDisplayValue(raw: string): number | "" {
  if (raw === "") return ""
  const normalized = raw.replace(",", ".")
  const n = parseFloat(normalized)
  return Number.isNaN(n) ? "" : n
}

export function NumberField({ input, control }: NumberFieldProps) {
  return (
    <FormField
      control={control}
      name={input.key}
      render={({ field }) => <NumberFieldInner input={input} field={field} />}
    />
  )
}

/** Inner component so we can use useState/useRef per field instance. */
function NumberFieldInner({
  input,
  field,
}: {
  input: FormInput
  field: {
    value: unknown
    onChange: (v: number | "") => void
    onBlur: () => void
    ref: (el: unknown) => void
  }
}) {
  const [localValue, setLocalValue] = useState(() =>
    toDisplayValue(field.value)
  )
  const hasFocusRef = useRef(false)

  // Sync from form when value is set externally (e.g. reset / default) and input is not focused
  useEffect(() => {
    if (hasFocusRef.current) return
    const next = toDisplayValue(field.value)
    setLocalValue(next)
  }, [field.value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setLocalValue(raw)
    // Only clear the form value when user deletes everything; otherwise commit on blur
    if (raw === "") field.onChange("")
  }

  const handleBlur = () => {
    hasFocusRef.current = false
    const parsed = fromDisplayValue(localValue)
    field.onChange(parsed)
    setLocalValue(toDisplayValue(parsed))
    field.onBlur()
  }

  const handleFocus = () => {
    hasFocusRef.current = true
  }

  return (
    <FormItem>
      <FormLabel>
        {input.label}
        {input.required !== false && (
          <span className="text-destructive ml-1">*</span>
        )}
      </FormLabel>
      <FormControl>
        <Input
          type="text"
          inputMode="decimal"
          placeholder={input.description || input.label}
          min={input.min}
          max={input.max}
          ref={field.ref}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
      </FormControl>
      {input.description && (
        <FormDescription>{input.description}</FormDescription>
      )}
      <FormMessage />
    </FormItem>
  )
}
