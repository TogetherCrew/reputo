"use client"

import type {
  ResourceCatalog,
  ResourceCatalogResource,
} from "@reputo/reputation-algorithms"

export interface ResourceSelection {
  chain: string
  resource_key: string
}

export interface ResourceSelectorExplorerViewModel {
  label: string
  title: string
  href?: string
  ariaLabel: string
}

export interface ResourceSelectorRowViewModel {
  key: string
  chainKey: string
  resourceKey: string
  selected: boolean
  label: string
  description?: string
  kind: "token" | "contract"
  kindLabel: string
  iconUrl?: string
  explorer: ResourceSelectorExplorerViewModel
}

export interface ResourceSelectorPanelViewModel {
  key: string
  label: string
  supportedCount: number
  rows: ResourceSelectorRowViewModel[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function normalizeResourceSelections(
  value: unknown
): ResourceSelection[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) =>
    isRecord(item) &&
    typeof item.chain === "string" &&
    typeof item.resource_key === "string"
      ? [
          {
            chain: item.chain,
            resource_key: item.resource_key,
          },
        ]
      : []
  )
}

function buildSelectionOrder(catalog: ResourceCatalog): Map<string, number> {
  const order = new Map<string, number>()
  let index = 0

  for (const chain of catalog.chains) {
    for (const resource of chain.resources) {
      order.set(`${chain.key}:${resource.key}`, index)
      index += 1
    }
  }

  return order
}

export function sortResourceSelections(
  selections: ReadonlyArray<ResourceSelection>,
  catalog: ResourceCatalog
): ResourceSelection[] {
  const order = buildSelectionOrder(catalog)

  return [...selections].sort((left, right) => {
    const leftOrder =
      order.get(`${left.chain}:${left.resource_key}`) ?? Number.MAX_SAFE_INTEGER
    const rightOrder =
      order.get(`${right.chain}:${right.resource_key}`) ??
      Number.MAX_SAFE_INTEGER

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }

    return `${left.chain}:${left.resource_key}`.localeCompare(
      `${right.chain}:${right.resource_key}`
    )
  })
}

function buildExplorerViewModel(resource: ResourceCatalogResource) {
  const title = resource.identifier
  const label = resource.explorerLabel ?? "Explorer"
  const explorerName = resource.explorerLabel ?? "block explorer"

  return {
    label,
    title,
    href: resource.explorerUrl,
    ariaLabel: resource.explorerUrl
      ? `Open ${resource.label} in ${explorerName}: ${resource.identifier}`
      : `${resource.label} identifier ${resource.identifier}`,
  } satisfies ResourceSelectorExplorerViewModel
}

export function buildResourceSelectorPanels(args: {
  catalog: ResourceCatalog
  selections: ReadonlyArray<ResourceSelection>
  getChainIconUrl?: (chainKey: string) => string | undefined
}): ResourceSelectorPanelViewModel[] {
  const selectionKeys = new Set(
    args.selections.map(
      (selection) => `${selection.chain}:${selection.resource_key}`
    )
  )

  return args.catalog.chains.map((chain) => ({
    key: chain.key,
    label: chain.label,
    supportedCount: chain.resources.length,
    rows: chain.resources.map((resource) => ({
      key: `${chain.key}:${resource.key}`,
      chainKey: chain.key,
      resourceKey: resource.key,
      selected: selectionKeys.has(`${chain.key}:${resource.key}`),
      label: resource.label,
      description: resource.description,
      kind: resource.kind,
      kindLabel: resource.kind === "token" ? "Token" : "Contract",
      iconUrl: resource.iconUrl ?? args.getChainIconUrl?.(chain.key),
      explorer: buildExplorerViewModel(resource),
    })),
  }))
}
