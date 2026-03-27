"use client"

import { ExternalLink } from "lucide-react"
import Image from "next/image"
import type { KeyboardEvent } from "react"
import type { Control } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { getChainMeta } from "../chain-token-metadata"
import type { FormInput } from "../schema-builder"
import {
  buildResourceSelectorPanels,
  normalizeResourceSelections,
  sortResourceSelections,
} from "./resource-selector-field.utils"

interface ResourceSelectorFieldProps {
  input: FormInput
  control: Control<any>
}

function ResourceIcon({ url, label }: { url: string; label: string }) {
  return (
    <Image
      src={url}
      alt={label}
      width={24}
      height={24}
      className="rounded-full shrink-0"
      unoptimized
    />
  )
}

function shouldIgnoreRowToggle(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.closest("a")) {
    return true
  }

  if (target.closest('[data-slot="checkbox"]')) {
    return true
  }

  return target.tagName === "INPUT"
}

export function ResourceSelectorField({
  input,
  control,
}: ResourceSelectorFieldProps) {
  const catalog = input.resourceCatalog

  if (!catalog) {
    return null
  }

  return (
    <FormField
      control={control}
      name={input.key}
      render={({ field }) => {
        const selections = sortResourceSelections(
          normalizeResourceSelections(field.value),
          catalog
        )
        const panels = buildResourceSelectorPanels({
          catalog,
          selections,
          getChainIconUrl: (chainKey) => getChainMeta(chainKey)?.iconUrl,
        })

        const toggleSelection = (
          chainKey: string,
          resourceKey: string,
          checked: boolean
        ) => {
          const selectionKey = `${chainKey}:${resourceKey}`
          const nextSelections = checked
            ? [...selections, { chain: chainKey, resource_key: resourceKey }]
            : selections.filter(
                (selection) =>
                  `${selection.chain}:${selection.resource_key}` !==
                  selectionKey
              )

          field.onChange(sortResourceSelections(nextSelections, catalog))
        }

        const handleRowKeyDown = (
          event: KeyboardEvent<HTMLDivElement>,
          chainKey: string,
          resourceKey: string,
          selected: boolean
        ) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return
          }

          event.preventDefault()
          toggleSelection(chainKey, resourceKey, !selected)
        }

        return (
          <FormItem className="space-y-3">
            <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <FormLabel className="text-base font-semibold">
                    {input.label}
                    {input.required !== false && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </FormLabel>
                  {input.description && (
                    <FormDescription className="max-w-3xl">
                      {input.description}
                    </FormDescription>
                  )}
                </div>

                <Badge
                  variant="secondary"
                  className="shrink-0 rounded-full px-3 py-1 text-sm font-medium"
                >
                  {selections.length} selected
                </Badge>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {panels.map((panel) => (
                  <section
                    key={panel.key}
                    className="overflow-hidden rounded-xl border bg-muted/20"
                  >
                    <div className="border-b px-4 py-4">
                      <h3 className="text-xl font-semibold leading-none">
                        {panel.label}
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm">
                        {panel.supportedCount} supported resources
                      </p>
                    </div>

                    <div className="px-3 pb-3 pt-2 md:px-4 md:pb-4">
                      <div className="text-muted-foreground grid grid-cols-[minmax(0,1.8fr)_120px] gap-3 px-3 pb-2 text-xs font-semibold uppercase tracking-wide">
                        <span>Name</span>
                        <span>Explorer</span>
                      </div>

                      <div className="space-y-2">
                        {panel.rows.map((row) => (
                          <div
                            key={row.key}
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              if (shouldIgnoreRowToggle(event.target)) {
                                return
                              }

                              toggleSelection(
                                row.chainKey,
                                row.resourceKey,
                                !row.selected
                              )
                            }}
                            onKeyDown={(event) =>
                              handleRowKeyDown(
                                event,
                                row.chainKey,
                                row.resourceKey,
                                row.selected
                              )
                            }
                            className={cn(
                              "grid grid-cols-[minmax(0,1.8fr)_120px] items-center gap-3 rounded-xl border bg-background px-3 py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                              row.selected
                                ? "border-primary/60 bg-primary/5"
                                : "border-border hover:border-border/80 hover:bg-accent/20"
                            )}
                            aria-pressed={row.selected}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <Checkbox
                                checked={row.selected}
                                onCheckedChange={(value) =>
                                  toggleSelection(
                                    row.chainKey,
                                    row.resourceKey,
                                    value === true
                                  )
                                }
                                onClick={(event) => event.stopPropagation()}
                                aria-label={`Select ${row.label}`}
                              />

                              {row.iconUrl && (
                                <ResourceIcon
                                  url={row.iconUrl}
                                  label={row.label}
                                />
                              )}

                              <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <span className="truncate text-sm font-semibold">
                                    {row.label}
                                  </span>
                                  <Badge
                                    variant={
                                      row.kind === "token"
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className="rounded-full px-2.5 py-1 text-xs capitalize"
                                  >
                                    {row.kindLabel}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="min-w-0">
                              {row.explorer.href ? (
                                <a
                                  href={row.explorer.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-muted-foreground hover:text-foreground flex min-w-0 items-center gap-1.5 text-xs font-medium md:text-sm"
                                  onClick={(event) => event.stopPropagation()}
                                  title={row.explorer.title}
                                  aria-label={row.explorer.ariaLabel}
                                >
                                  <span className="min-w-0 truncate">
                                    {row.explorer.label}
                                  </span>
                                  <ExternalLink className="size-3.5 shrink-0" />
                                </a>
                              ) : (
                                <span
                                  className="text-muted-foreground block truncate text-xs md:text-sm"
                                  title={row.explorer.title}
                                >
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <FormMessage className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm" />
          </FormItem>
        )
      }}
    />
  )
}
