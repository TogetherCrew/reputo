interface ApiErrorPayload {
  message?:
    | {
        message?: string[] | string
        errors?: Array<{
          inputKey?: string
          field?: string
          message?: string
          errors?: string[]
        }>
        error?: string
        statusCode?: number
      }
    | string
  errors?: Array<{
    inputKey?: string
    field?: string
    message?: string
    errors?: string[]
  }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getApiErrorPayload(error: unknown): ApiErrorPayload | null {
  if (!isRecord(error)) {
    return null
  }

  const response = error.response
  if (isRecord(response) && isRecord(response.data)) {
    return response.data as ApiErrorPayload
  }

  return error as ApiErrorPayload
}

function getValidationEntries(payload: ApiErrorPayload | null): Array<{
  inputKey?: string
  field?: string
  message?: string
  errors?: string[]
}> {
  const entries: Array<{
    inputKey?: string
    field?: string
    message?: string
    errors?: string[]
  }> = []

  if (Array.isArray(payload?.errors)) {
    entries.push(...payload.errors)
  }

  if (
    payload?.message &&
    typeof payload.message !== "string" &&
    Array.isArray(payload.message.errors)
  ) {
    entries.push(...payload.message.errors)
  }

  return entries
}

export function extractApiErrorMessages(error: unknown): string[] {
  const payload = getApiErrorPayload(error)
  const messages: string[] = []

  for (const entry of getValidationEntries(payload)) {
    if (Array.isArray(entry.errors)) {
      messages.push(
        ...entry.errors.filter((message) => typeof message === "string")
      )
    } else if (typeof entry.message === "string") {
      messages.push(entry.message)
    }
  }

  if (messages.length > 0) {
    return [...new Set(messages)]
  }

  if (payload?.message) {
    if (typeof payload.message === "string") {
      messages.push(payload.message)
    } else if (Array.isArray(payload.message.message)) {
      messages.push(
        ...payload.message.message.filter(
          (message) => typeof message === "string"
        )
      )
    } else if (typeof payload.message.message === "string") {
      messages.push(payload.message.message)
    }
  }

  if (
    messages.length === 0 &&
    isRecord(error) &&
    typeof error.message === "string"
  ) {
    messages.push(error.message)
  }

  return [...new Set(messages)]
}

export function extractApiFieldErrors(
  error: unknown
): { field: string; message: string }[] {
  const payload = getApiErrorPayload(error)
  const fieldErrors: { field: string; message: string }[] = []

  for (const entry of getValidationEntries(payload)) {
    const field = entry.inputKey || entry.field || "_general"

    if (Array.isArray(entry.errors)) {
      fieldErrors.push(
        ...entry.errors
          .filter((message) => typeof message === "string")
          .map((message) => ({ field, message }))
      )
      continue
    }

    if (typeof entry.message === "string") {
      fieldErrors.push({ field, message: entry.message })
    }
  }

  if (fieldErrors.length > 0) {
    return fieldErrors
  }

  const messages = extractApiErrorMessages(error)
  return messages.map((message) => ({
    field: "_general",
    message,
  }))
}
