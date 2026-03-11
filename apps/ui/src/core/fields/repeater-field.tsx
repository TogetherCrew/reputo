"use client"

import { Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import {
  type Control,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getChainMeta, getTokenMeta } from "../chain-token-metadata"
import type {
  FormInput,
  FormInputProperty,
  SelectOption,
} from "../schema-builder"

interface RepeaterFieldProps {
  input: FormInput
  control: Control<any>
}

function OptionIcon({ url, label }: { url: string; label: string }) {
  return (
    <Image
      src={url}
      alt={label}
      width={20}
      height={20}
      className="rounded-full shrink-0"
      unoptimized
    />
  )
}

function getIconForProperty(
  prop: FormInputProperty,
  value: string,
  rowValues?: Record<string, unknown>
): string | undefined {
  if (prop.key === "chain_id") {
    return getChainMeta(value)?.iconUrl
  }
  if (prop.key === "contract_address" && rowValues?.chain_id) {
    return getTokenMeta(String(rowValues.chain_id), value)?.iconUrl
  }
  return undefined
}

function PropertyField({
  prop,
  fieldPrefix,
  control,
  rowValues,
  onDependentChange,
}: {
  prop: FormInputProperty
  fieldPrefix: string
  control: Control<any>
  rowValues?: Record<string, unknown>
  onDependentChange?: (key: string) => void
}) {
  const fieldName = `${fieldPrefix}.${prop.key}`

  if (prop.type === "select" && prop.options) {
    return (
      <FormField
        control={control}
        name={fieldName}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel className="text-xs">
              {prop.label}
              {prop.required !== false && (
                <span className="text-destructive ml-0.5">*</span>
              )}
            </FormLabel>
            <Select
              onValueChange={(val) => {
                field.onChange(val)
                onDependentChange?.(prop.key)
              }}
              value={field.value ?? ""}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={`Select ${prop.label.toLowerCase()}`}
                  >
                    {field.value &&
                      (() => {
                        const selected = prop.options?.find(
                          (o) => o.value === field.value
                        )
                        const icon = getIconForProperty(
                          prop,
                          field.value,
                          rowValues
                        )
                        if (!selected) return field.value
                        return (
                          <span className="flex items-center gap-2">
                            {icon && (
                              <OptionIcon url={icon} label={selected.label} />
                            )}
                            {selected.label}
                          </span>
                        )
                      })()}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {(prop.options ?? []).map((option: SelectOption) => {
                  const icon = getIconForProperty(prop, option.value, rowValues)
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        {icon && <OptionIcon url={icon} label={option.label} />}
                        {option.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel className="text-xs">
            {prop.label}
            {prop.required !== false && (
              <span className="text-destructive ml-0.5">*</span>
            )}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={prop.description || prop.label}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function RepeaterRow({
  index,
  fieldPrefix,
  properties,
  control,
  canRemove,
  onRemove,
}: {
  index: number
  fieldPrefix: string
  properties: FormInputProperty[]
  control: Control<any>
  canRemove: boolean
  onRemove: () => void
}) {
  const { setValue } = useFormContext()
  const rowValues = useWatch({ control, name: fieldPrefix }) as
    | Record<string, unknown>
    | undefined

  const dependencyMap = new Map<string, string[]>()
  for (const prop of properties) {
    if (prop.dependsOn) {
      const deps = dependencyMap.get(prop.dependsOn) ?? []
      deps.push(prop.key)
      dependencyMap.set(prop.dependsOn, deps)
    }
  }

  const handleDependentChange = (changedKey: string) => {
    const dependents = dependencyMap.get(changedKey)
    if (!dependents) return
    for (const depKey of dependents) {
      setValue(`${fieldPrefix}.${depKey}`, "", { shouldValidate: true })
    }
  }

  return (
    <div className="flex items-end gap-3 p-3 rounded-lg border bg-muted/30">
      <div className="flex-1 flex gap-3">
        {properties.map((prop) => (
          <PropertyField
            key={prop.key}
            prop={prop}
            fieldPrefix={fieldPrefix}
            control={control}
            rowValues={rowValues as Record<string, unknown>}
            onDependentChange={handleDependentChange}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        disabled={!canRemove}
        onClick={onRemove}
        aria-label={`Remove row ${index + 1}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

export function RepeaterField({ input, control }: RepeaterFieldProps) {
  const properties = input.itemProperties ?? []
  const minItems = input.minItems ?? 0

  const { fields, append, remove } = useFieldArray({
    control,
    name: input.key,
  })

  const buildDefaultRow = (): Record<string, unknown> => {
    const row: Record<string, unknown> = {}
    for (const prop of properties) {
      row[prop.key] = prop.default ?? ""
    }
    return row
  }

  return (
    <FormItem>
      <FormLabel>
        {input.label}
        {input.required !== false && (
          <span className="text-destructive ml-1">*</span>
        )}
      </FormLabel>
      {input.description && (
        <FormDescription>{input.description}</FormDescription>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <RepeaterRow
            key={field.id}
            index={index}
            fieldPrefix={`${input.key}.${index}`}
            properties={properties}
            control={control}
            canRemove={fields.length > minItems}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append(buildDefaultRow())}
      >
        <Plus className="mr-2 size-4" />
        {input.addButtonLabel ?? "Add item"}
      </Button>

      <FormField
        control={control}
        name={input.key}
        render={() => <FormMessage />}
      />
    </FormItem>
  )
}
