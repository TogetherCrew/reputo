"use client"

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
      render={({ field }) => (
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
              {...field}
              onChange={(e) => {
                field.onChange(fromDisplayValue(e.target.value))
              }}
              value={toDisplayValue(field.value)}
            />
          </FormControl>
          {input.description && (
            <FormDescription>{input.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
