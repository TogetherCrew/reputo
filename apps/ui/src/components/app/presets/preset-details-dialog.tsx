"use client"

import {
  type AlgorithmDefinition,
  getAlgorithmDefinition,
} from "@reputo/reputation-algorithms"
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
import type { AlgorithmPresetResponseDto } from "@/lib/api/types"
import { FileDisplay } from "../file-display"

interface PresetDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  preset: AlgorithmPresetResponseDto | null
}

/**
 * Check if a value looks like a storage key (file path)
 */
function isStorageKey(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false
  return value.includes("/") || value.startsWith("uploads/")
}

/**
 * Convert snake_case or camelCase to Title Case
 */
function toTitleCase(str: string): string {
  return str
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function PresetDetailsDialog({
  isOpen,
  onClose,
  preset,
}: PresetDetailsDialogProps) {
  // Fetch algorithm definition to get input labels
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

  // Create a map from input key to label
  const inputLabels = useMemo(() => {
    const labels: Record<string, string> = {}
    if (algorithmDefinition?.inputs) {
      for (const input of algorithmDefinition.inputs) {
        labels[input.key] = input.label || toTitleCase(input.key)
      }
    }
    return labels
  }, [algorithmDefinition])

  // Get label for an input key
  const getLabel = (key: string): string => {
    return inputLabels[key] || toTitleCase(key)
  }

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
            {/* Metadata Grid - Compact 2-column layout */}
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

            {/* Separator */}
            <div className="border-t" />

            {/* Input Parameters - Compact table style */}
            <div>
              <h3 className="text-sm font-medium mb-2">Parameters</h3>
              <div className="rounded-lg border divide-y">
                {preset.inputs.map((input) =>
                  isStorageKey(input.value) ? (
                    <div key={input.key} className="p-2.5">
                      <FileDisplay
                        label={getLabel(input.key)}
                        storageKey={input.value}
                      />
                    </div>
                  ) : (
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
                )}
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
