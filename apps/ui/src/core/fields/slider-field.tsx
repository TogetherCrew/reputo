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
import { Slider } from "@/components/ui/slider";
import type { SliderInput } from "@reputo/algorithm-validator";

interface SliderFieldProps {
  input: SliderInput;
  control: Control<any>;
}

export function SliderField({ input, control }: SliderFieldProps) {
  return (
    <FormField
      control={control}
      name={input.key}
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel>
              {input.label}
              {input.required !== false && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <span className="text-sm text-muted-foreground font-mono">
              {field.value ?? input.min}
            </span>
          </div>
          <FormControl>
            <Slider
              min={input.min}
              max={input.max}
              step={input.step || 1}
              value={[field.value ?? input.min]}
              onValueChange={(vals) => field.onChange(vals[0])}
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

