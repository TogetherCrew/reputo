"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { queryKeys } from "./hooks"
import { handleAuthFailure, snapshotsApi } from "./services"

export interface SnapshotEventData {
  _id: string
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  algorithmPreset?: string
  outputs?: Record<string, unknown>
  startedAt?: string
  completedAt?: string
  updatedAt: string
}

export interface SnapshotEvent {
  type: "snapshot:updated"
  data: SnapshotEventData
}

interface UseAuthAwareSnapshotEventsOptions {
  algorithmPreset?: string
  enabled?: boolean
}

/**
 * Hook to subscribe to real-time snapshot status updates via SSE.
 * Auth-aware: detects session expiry and redirects to /login instead of
 * reconnecting forever.
 */
export function useAuthAwareSnapshotEvents(
  options?: UseAuthAwareSnapshotEventsOptions
) {
  const { algorithmPreset, enabled = true } = options ?? {}
  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const scheduleReconnect = (connect: () => void) => {
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, 5000)
    }

    const connect = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const eventSource = snapshotsApi.subscribeToEvents({
        algorithmPreset,
      })
      eventSourceRef.current = eventSource

      eventSource.onmessage = (event) => {
        try {
          const parsedEvent = JSON.parse(event.data) as SnapshotEvent

          if (parsedEvent.type === "snapshot:updated") {
            // Invalidate snapshots queries to trigger a refetch
            queryClient.invalidateQueries({
              queryKey: queryKeys.snapshots.lists(),
            })

            // Also invalidate the specific snapshot detail if it's cached
            queryClient.invalidateQueries({
              queryKey: queryKeys.snapshots.detail(parsedEvent.data._id),
            })
          }
        } catch (error) {
          console.error("Failed to parse snapshot event:", error)
        }
      }

      eventSource.onerror = () => {
        // Capture readyState before we close — CLOSED means the server
        // rejected the connection (e.g. 401); CONNECTING means a transient
        // network drop where the browser would normally auto-reconnect.
        const serverRejected = eventSource.readyState === EventSource.CLOSED

        eventSource.close()
        eventSourceRef.current = null

        if (serverRejected) {
          // Verify whether the rejection was an auth failure before
          // redirecting — avoids a false redirect on non-auth HTTP errors.
          fetch("/api/v1/auth/deep-id/me", { credentials: "include" })
            .then((res) => {
              if (!res.ok) {
                handleAuthFailure()
              } else {
                // Non-auth server error; retry after delay
                scheduleReconnect(connect)
              }
            })
            .catch(() => {
              handleAuthFailure()
            })
          return
        }

        // Transient connection loss — reconnect after delay
        scheduleReconnect(connect)
      }
    }

    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [algorithmPreset, enabled, queryClient])
}
