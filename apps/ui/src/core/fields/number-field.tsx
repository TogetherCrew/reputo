"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { NumberInput } from "@reputo/algorithm-validator";

interface NumberFieldProps {
  input: NumberInput;
  control: Control<any>;
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
            {input.required !== false && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={input.description || input.label}
              min={input.min}
              max={input.max}
              {...field}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === "" ? undefined : parseFloat(value));
              }}
              value={field.value ?? ""}
            />
          </FormControl>
          {input.description && (
            <FormDescription>{input.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

