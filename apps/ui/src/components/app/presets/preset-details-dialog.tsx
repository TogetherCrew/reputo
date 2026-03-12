"use client"

import {
  type AlgorithmDefinition,
  type ArrayIoItem,
  getAlgorithmDefinition,
} from "@reputo/reputation-algorithms"
import Image from "next/image"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getChainMeta, getTokenMeta } from "@/core/chain-token-metadata"
import type { AlgorithmPresetResponseDto } from "@/lib/api/types"
import { FileDisplay } from "../file-display"

interface PresetDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  preset: AlgorithmPresetResponseDto | null
}

function isStorageKey(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false
  return value.includes("/") || value.startsWith("uploads/")
}

function toTitleCase(str: string): string {
  return str
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function MetaIcon({ url, label }: { url: string; label: string }) {
  return (
    <Image
      src={url}
      alt={label}
      width={16}
      height={16}
      className="rounded-full shrink-0 inline-block"
      unoptimized
    />
  )
}

function ArrayValueDisplay({
  value,
  definitionInput,
}: {
  value: unknown[]
  definitionInput?: ArrayIoItem
}) {
  const properties = definitionInput?.item?.properties ?? []
  const propLabels = new Map(properties.map((p) => [p.key, p.label ?? p.key]))

  return (
    <div className="space-y-1.5">
      {value.map((item, idx) => {
        const itemKey =
          typeof item === "object" && item
            ? Object.values(item as Record<string, unknown>).join("-")
            : String(item)

        if (typeof item !== "object" || !item) {
          return (
            <div key={itemKey} className="text-sm font-medium">
              {String(item)}
            </div>
          )
        }

        const entries = Object.entries(item as Record<string, unknown>)
        return (
          <div
            key={itemKey}
            className="flex flex-wrap gap-x-4 gap-y-1 p-2 rounded border bg-muted/30 text-sm"
          >
            {entries.map(([k, v]) => {
              const chain = (item as Record<string, unknown>).chain_id
              const chainMeta =
                k === "chain_id" ? getChainMeta(String(v)) : undefined
              const tokenMeta =
                k === "contract_address" && chain
                  ? getTokenMeta(String(chain), String(v))
                  : undefined

              const displayLabel =
                chainMeta?.label ?? tokenMeta?.label ?? String(v)
              const iconUrl = chainMeta?.iconUrl ?? tokenMeta?.iconUrl

              return (
                <div key={k} className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">
                    {propLabels.get(k) ?? toTitleCase(k)}:
                  </span>
                  {iconUrl && <MetaIcon url={iconUrl} label={displayLabel} />}
                  <span className="font-medium">{displayLabel}</span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export function PresetDetailsDialog({
  isOpen,
  onClose,
  preset,
}: PresetDetailsDialogProps) {
  const algorithmDefinition = useMemo(() => {
    if (!preset) return null
    try {
      const definitionJson = getAlgorithmDefinition({ key: preset.key })
      return JSON.parse(definitionJson) as AlgorithmDefinition
    } catch (error) {
      console.warn(`Could not fetch definition for ${preset.key}:`, error)
      return null
    }
  }, [preset])

  const inputLabels = useMemo(() => {
    const labels: Record<string, string> = {}
    if (algorithmDefinition?.inputs) {
      for (const input of algorithmDefinition.inputs) {
        labels[input.key] = input.label || toTitleCase(input.key)
      }
    }
    return labels
  }, [algorithmDefinition])

  const getLabel = (key: string): string => {
    return inputLabels[key] || toTitleCase(key)
  }

  const getDefinitionInput = (key: string) =>
    algorithmDefinition?.inputs.find((i) => i.key === key)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{preset?.name || "Preset Details"}</DialogTitle>
          <DialogDescription>
            {preset?.description || "Algorithm preset configuration"}
          </DialogDescription>
        </DialogHeader>

        {preset && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Algorithm</span>
                <span className="font-medium">{toTitleCase(preset.key)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">{preset.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(preset.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">
                  {new Date(preset.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="border-t" />

            <div>
              <h3 className="text-sm font-medium mb-2">Parameters</h3>
              <div className="rounded-lg border divide-y">
                {preset.inputs.map((input) => {
                  if (Array.isArray(input.value)) {
                    const defInput = getDefinitionInput(input.key)
                    return (
                      <div key={input.key} className="px-3 py-2 space-y-1.5">
                        <span className="text-sm text-muted-foreground">
                          {getLabel(input.key)}
                        </span>
                        <ArrayValueDisplay
                          value={input.value}
                          definitionInput={
                            defInput?.type === "array"
                              ? (defInput as ArrayIoItem)
                              : undefined
                          }
                        />
                      </div>
                    )
                  }

                  if (isStorageKey(input.value)) {
                    return (
                      <div key={input.key} className="p-2.5">
                        <FileDisplay
                          label={getLabel(input.key)}
                          storageKey={input.value}
                        />
                      </div>
                    )
                  }

                  return (
                    <div
                      key={input.key}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <span className="text-sm text-muted-foreground">
                        {getLabel(input.key)}
                      </span>
                      <span className="text-sm font-medium">
                        {String(input.value)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
