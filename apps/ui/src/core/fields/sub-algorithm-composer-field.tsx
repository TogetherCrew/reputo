"use client"

import type { AlgorithmDefinition } from "@reputo/reputation-algorithms"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo } from "react"
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
import { renderScalarField } from "../render-field"
import {
  buildAlgorithmInputFormFields,
  type FormInput,
} from "../schema-builder"
import {
  buildChildInputsArray,
  type ChildAlgorithmOption,
  getSelectableChildAlgorithms,
  safeGetDefinition,
  safeGetVersions,
} from "./sub-algorithm-composer-field.utils"

interface SubAlgorithmComposerFieldProps {
  input: FormInput
  // biome-ignore lint/suspicious/noExplicitAny: react-hook-form control has dynamic value shape
  control: Control<any>
}

interface CachedDefinition {
  definition: AlgorithmDefinition
}

export function SubAlgorithmComposerField({
  input,
  control,
}: SubAlgorithmComposerFieldProps) {
  const fieldName = input.key
  const { fields, append, remove } = useFieldArray({ control, name: fieldName })

  const childOptions = useMemo(() => getSelectableChildAlgorithms(), [])
  const sharedInputKeys = useMemo(
    () => input.sharedInputKeys ?? [],
    [input.sharedInputKeys]
  )
  const minItems = input.minItems ?? 1

  const handleAddRow = () => {
    append({
      algorithm_key: "",
      algorithm_version: "",
      weight: 1,
      inputs: [],
    })
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

      <div className="space-y-3">
        {fields.map((field, index) => (
          <SubAlgorithmRow
            key={field.id}
            index={index}
            rowPrefix={`${fieldName}.${index}`}
            control={control}
            childOptions={childOptions}
            sharedInputKeys={sharedInputKeys}
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
        onClick={handleAddRow}
      >
        <Plus className="mr-2 size-4" />
        {input.addButtonLabel ?? "Add sub-algorithm"}
      </Button>

      <FormField
        control={control}
        name={fieldName}
        render={() => <FormMessage />}
      />
    </FormItem>
  )
}

interface SubAlgorithmRowProps {
  index: number
  rowPrefix: string
  // biome-ignore lint/suspicious/noExplicitAny: react-hook-form control has dynamic value shape
  control: Control<any>
  childOptions: ChildAlgorithmOption[]
  sharedInputKeys: ReadonlyArray<string>
  canRemove: boolean
  onRemove: () => void
}

function SubAlgorithmRow({
  index,
  rowPrefix,
  control,
  childOptions,
  sharedInputKeys,
  canRemove,
  onRemove,
}: SubAlgorithmRowProps) {
  const { setValue } = useFormContext()
  const selectedKey = useWatch({
    control,
    name: `${rowPrefix}.algorithm_key`,
  }) as string | undefined
  const selectedVersion = useWatch({
    control,
    name: `${rowPrefix}.algorithm_version`,
  }) as string | undefined

  const availableVersions = useMemo(() => {
    if (!selectedKey) return []
    return safeGetVersions(selectedKey)
  }, [selectedKey])

  const childDefinition: CachedDefinition | null = useMemo(() => {
    if (!selectedKey || !selectedVersion) return null
    const definition = safeGetDefinition(selectedKey, selectedVersion)
    return definition ? { definition } : null
  }, [selectedKey, selectedVersion])

  // When the algorithm key changes, auto-select the latest version if none set
  useEffect(() => {
    if (!selectedKey) return
    if (selectedVersion && availableVersions.includes(selectedVersion)) return
    const latest = availableVersions[availableVersions.length - 1]
    if (latest) {
      setValue(`${rowPrefix}.algorithm_version`, latest, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }, [availableVersions, rowPrefix, selectedKey, selectedVersion, setValue])

  const { getValues } = useFormContext()

  // When the selected child algorithm changes, align the inputs array with
  // the algorithm's definition. Preserves existing values when the shape
  // already matches (edit flow).
  useEffect(() => {
    if (!childDefinition) {
      return
    }
    const expected = buildChildInputsArray(
      childDefinition.definition,
      sharedInputKeys
    )
    const raw = getValues(`${rowPrefix}.inputs`) as
      | Array<{ key?: string; value?: unknown }>
      | undefined
    const expectedKeys = expected.map((item) => item.key)
    const actualKeys = Array.isArray(raw)
      ? raw.map((item) => item?.key).filter(Boolean)
      : []
    const matches =
      expectedKeys.length === actualKeys.length &&
      expectedKeys.every((key, index) => key === actualKeys[index])
    if (matches) {
      return
    }
    const merged = expected.map((expectedItem) => {
      const existing = raw?.find((item) => item?.key === expectedItem.key)
      return existing && existing.value !== undefined
        ? { key: expectedItem.key, value: existing.value }
        : expectedItem
    })
    setValue(`${rowPrefix}.inputs`, merged, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [childDefinition, getValues, rowPrefix, setValue, sharedInputKeys])

  const childFormFields: FormInput[] = useMemo(() => {
    if (!childDefinition) return []
    return buildAlgorithmInputFormFields(
      childDefinition.definition,
      sharedInputKeys
    )
  }, [childDefinition, sharedInputKeys])

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="flex-1 grid gap-3 sm:grid-cols-3">
          <FormField
            control={control}
            name={`${rowPrefix}.algorithm_key`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Algorithm</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Reset version so the effect above picks the latest one.
                    setValue(`${rowPrefix}.algorithm_version`, "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {childOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${rowPrefix}.algorithm_version`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Version</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                  disabled={!selectedKey || availableVersions.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableVersions.map((version) => (
                      <SelectItem key={version} value={version}>
                        {version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${rowPrefix}.weight`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Weight</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const raw = event.target.value
                      if (raw === "") {
                        field.onChange("")
                        return
                      }
                      const parsed = Number(raw.replace(",", "."))
                      field.onChange(Number.isFinite(parsed) ? parsed : raw)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label={`Remove sub-algorithm ${index + 1}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {childDefinition && childFormFields.length > 0 && (
        <div className="flex flex-col gap-3 pl-3 border-l-2 border-border">
          {childFormFields.map((childField, childIndex) =>
            renderScalarField(
              {
                ...childField,
                // Rebind the form path to the composer array slot. The
                // internal `.value` is what the API payload stores; we keep
                // the original `key` on the sibling `.key` field (set by the
                // parent's buildChildInputsArray helper).
                key: `${rowPrefix}.inputs.${childIndex}.value`,
              },
              control
            )
          )}
        </div>
      )}
    </div>
  )
}
