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
import { Switch } from "@/components/ui/switch";
import type { BooleanInput } from "../types";

interface BooleanFieldProps {
  input: BooleanInput;
  control: Control<any>;
}

export function BooleanField({ input, control }: BooleanFieldProps) {
  return (
    <FormField
      control={control}
      name={input.key}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">
              {input.label}
              {input.required !== false && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {input.description && (
              <FormDescription>{input.description}</FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

