"use client"

import { ExternalLink, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import {
  type Control,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form"
import { badgeVariants } from "@/components/ui/badge"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getChainMeta, getTokenMeta } from "../chain-token-metadata"
import type {
  ArrayPreset,
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
  if (prop.key === "chain") {
    return getChainMeta(value)?.iconUrl
  }
  if (prop.key === "asset_identifier" && rowValues?.chain) {
    return getTokenMeta(String(rowValues.chain), value)?.iconUrl
  }
  return undefined
}

function PropertyField({
  prop,
  fieldPrefix,
  control,
  rowValues,
  onDependentChange,
  selectedPairsInOtherRows,
}: {
  prop: FormInputProperty
  fieldPrefix: string
  control: Control<any>
  rowValues?: Record<string, unknown>
  onDependentChange?: (key: string) => void
  /** When set, token (contract_address) options already selected in other rows are disabled */
  selectedPairsInOtherRows?: Set<string>
}) {
  const fieldName = `${fieldPrefix}.${prop.key}`

  if (prop.type === "select" && prop.options) {
    const isTokenSelect =
      prop.key === "asset_identifier" &&
      selectedPairsInOtherRows &&
      rowValues?.chain != null

    const chainId =
      rowValues?.chain != null ? String(rowValues.chain) : undefined
    const visibleOptions = (prop.options ?? []).filter(
      (o) => o.filterBy == null || o.filterBy === chainId
    )

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
                        const content = (
                          <span className="flex items-center gap-2">
                            {icon && (
                              <OptionIcon url={icon} label={selected.label} />
                            )}
                            {selected.label}
                          </span>
                        )
                        if (prop.key === "asset_identifier") {
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>{content}</TooltipTrigger>
                              <TooltipContent side="bottom">
                                <span className="font-mono break-all">
                                  {field.value}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          )
                        }
                        return content
                      })()}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {visibleOptions.map((option: SelectOption) => {
                  const icon = getIconForProperty(prop, option.value, rowValues)
                  const pairKey =
                    isTokenSelect && rowValues?.chain != null
                      ? `${String(rowValues.chain)}:${option.value}`
                      : null
                  const disabled =
                    pairKey != null &&
                    (selectedPairsInOtherRows?.has(pairKey) ?? false)
                  return (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={disabled}
                    >
                      <span
                        className="flex items-center gap-2"
                        title={
                          prop.key === "asset_identifier"
                            ? option.value
                            : undefined
                        }
                      >
                        {icon && <OptionIcon url={icon} label={option.label} />}
                        {option.label}
                        {disabled && " (already added)"}
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
  selectedPairsInOtherRows,
}: {
  index: number
  fieldPrefix: string
  properties: FormInputProperty[]
  control: Control<any>
  canRemove: boolean
  onRemove: () => void
  selectedPairsInOtherRows?: Set<string>
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
      setValue(`${fieldPrefix}.${depKey}`, "", { shouldValidate: false })
    }
  }

  const selectedChain =
    rowValues?.chain != null ? String(rowValues.chain) : undefined
  const selectedAsset =
    rowValues?.asset_identifier != null && rowValues.asset_identifier !== ""
      ? String(rowValues.asset_identifier)
      : undefined
  const tokenMeta =
    selectedChain && selectedAsset
      ? getTokenMeta(selectedChain, selectedAsset)
      : undefined

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30">
      <div className="flex items-end gap-3">
        <div className="flex-1 flex gap-3">
          {properties.map((prop) => (
            <PropertyField
              key={prop.key}
              prop={prop}
              fieldPrefix={fieldPrefix}
              control={control}
              rowValues={rowValues as Record<string, unknown>}
              onDependentChange={handleDependentChange}
              selectedPairsInOtherRows={selectedPairsInOtherRows}
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
      {tokenMeta?.explorerUrl && (
        <a
          href={tokenMeta.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 w-fit text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="size-3" />
          View on {tokenMeta.explorerName}
        </a>
      )}
    </div>
  )
}

function getSelectedPairsInOtherRows(
  values: Array<Record<string, unknown>> | undefined,
  rowIndex: number
): Set<string> {
  if (!Array.isArray(values)) return new Set()
  const set = new Set<string>()
  for (let i = 0; i < values.length; i++) {
    if (i === rowIndex) continue
    const row = values[i]
    const c = row?.chain
    const t = row?.asset_identifier
    if (c != null && c !== "" && t != null && t !== "") {
      set.add(`${String(c)}:${String(t)}`)
    }
  }
  return set
}

export function RepeaterField({ input, control }: RepeaterFieldProps) {
  const properties = input.itemProperties ?? []
  const minItems = input.minItems ?? 0

  const values = useWatch({ control, name: input.key }) as
    | Array<Record<string, unknown>>
    | undefined

  const hasChainTokenPair =
    properties.some((p) => p.key === "chain") &&
    properties.some((p) => p.key === "asset_identifier")

  const { fields, append, remove, replace } = useFieldArray({
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

      {input.arrayPresets && input.arrayPresets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {input.arrayPresets.map((preset: ArrayPreset) => {
            const chains = preset.value
              .map((row) => row.chain)
              .filter(Boolean)
              .join(", ")
            return (
              <Tooltip key={preset.label}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className={
                      badgeVariants({ variant: "secondary" }) +
                      " cursor-pointer hover:opacity-80 transition-opacity"
                    }
                    onClick={() => replace(preset.value)}
                  >
                    {preset.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span>
                    Fills {preset.label} on {chains}
                  </span>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
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
            selectedPairsInOtherRows={
              hasChainTokenPair
                ? getSelectedPairsInOtherRows(values, index)
                : undefined
            }
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
