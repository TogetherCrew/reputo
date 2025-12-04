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

interface TextFieldProps {
  input: FormInput
  control: Control<any>
}

export function TextField({ input, control }: TextFieldProps) {
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
              placeholder={input.description || input.label}
              disabled={input.key === "key" || input.key === "version"}
              {...field}
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
