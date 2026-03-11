"use client"

import { useEffect, useRef, useState } from "react"
import type { Control } from "react-hook-form"
import { Button } from "@/components/ui/button"
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

function toDisplayValue(value: unknown): string {
  if (value === "" || value === undefined || value === null) return ""
  const n = Number(value)
  return Number.isNaN(n) ? "" : String(n)
}

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

  useEffect(() => {
    if (hasFocusRef.current) return
    const next = toDisplayValue(field.value)
    setLocalValue(next)
  }, [field.value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setLocalValue(raw)
    if (raw === "") field.onChange("")
  }

  const handleBlur = () => {
    hasFocusRef.current = false
    let parsed = fromDisplayValue(localValue)
    if (
      input.type === "integer" &&
      typeof parsed === "number" &&
      Number.isFinite(parsed)
    ) {
      parsed = Math.round(parsed)
    }
    field.onChange(parsed)
    setLocalValue(toDisplayValue(parsed))
    field.onBlur()
  }

  const handleFocus = () => {
    hasFocusRef.current = true
  }

  const suffix = input.suffix as string | undefined
  const presets = input.presets as number[] | undefined

  return (
    <FormItem>
      <FormLabel>
        {input.label}
        {input.required !== false && (
          <span className="text-destructive ml-1">*</span>
        )}
      </FormLabel>
      <FormControl>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            inputMode={input.type === "integer" ? "numeric" : "decimal"}
            placeholder={input.description || input.label}
            min={input.min}
            max={input.max}
            ref={field.ref}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className={suffix ? "flex-1" : undefined}
          />
          {suffix && (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {suffix}
            </span>
          )}
        </div>
      </FormControl>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {presets.map((preset) => {
            const isActive = Number(field.value) === preset
            return (
              <Button
                key={preset}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => {
                  field.onChange(preset)
                  setLocalValue(String(preset))
                }}
              >
                {preset}
                {suffix ? ` ${suffix}` : ""}
              </Button>
            )
          })}
        </div>
      )}
      {input.description && (
        <FormDescription>{input.description}</FormDescription>
      )}
      <FormMessage />
    </FormItem>
  )
}
