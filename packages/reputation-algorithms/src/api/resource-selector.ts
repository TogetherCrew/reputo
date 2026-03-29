import type {
  AlgorithmDefinition,
  ArrayIoItem,
  ResourceCatalog,
  ResourceCatalogChain,
  ResourceCatalogResource,
} from '../shared/types/algorithm.js';

export interface ResourceSelectorInput extends ArrayIoItem {
  uiHint: NonNullable<ArrayIoItem['uiHint']> & {
    widget: 'resource_selector';
    resourceCatalog: ResourceCatalog;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isResourceSelectorInput(input: ArrayIoItem): input is ResourceSelectorInput {
  return (
    isRecord(input.uiHint) &&
    input.uiHint.widget === 'resource_selector' &&
    isRecord(input.uiHint.resourceCatalog) &&
    Array.isArray(input.uiHint.resourceCatalog.chains)
  );
}

export function getResourceSelectorInput(params: {
  definition: AlgorithmDefinition;
  inputKey: string;
}): ResourceSelectorInput | undefined {
  const input = params.definition.inputs.find(
    (candidate): candidate is ArrayIoItem => candidate.key === params.inputKey && candidate.type === 'array',
  );

  if (!input || !isResourceSelectorInput(input)) {
    return undefined;
  }

  return input;
}

export function getResourceCatalog(params: {
  definition: AlgorithmDefinition;
  inputKey: string;
}): ResourceCatalog | undefined {
  return getResourceSelectorInput(params)?.uiHint.resourceCatalog;
}

export function getResourceCatalogChain(params: {
  catalog: ResourceCatalog;
  chainKey: string;
}): ResourceCatalogChain | undefined {
  return params.catalog.chains.find((chain) => chain.key === params.chainKey);
}

export function getResourceCatalogResource(params: {
  catalog: ResourceCatalog;
  chainKey: string;
  resourceKey: string;
}): ResourceCatalogResource | undefined {
  const chain = getResourceCatalogChain({
    catalog: params.catalog,
    chainKey: params.chainKey,
  });

  return chain?.resources.find((resource) => resource.key === params.resourceKey);
}
