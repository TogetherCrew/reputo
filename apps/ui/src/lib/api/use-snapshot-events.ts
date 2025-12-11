'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { queryKeys } from './hooks'
import { snapshotsApi } from './services'

export interface SnapshotEventData {
    _id: string
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
    algorithmPreset?: string
    outputs?: Record<string, unknown>
    startedAt?: string
    completedAt?: string
    updatedAt: string
}

export interface SnapshotEvent {
    type: 'snapshot:updated'
    data: SnapshotEventData
}

interface UseSnapshotEventsOptions {
    algorithmPreset?: string
    enabled?: boolean
}

/**
 * Hook to subscribe to real-time snapshot status updates via SSE.
 * When a snapshot status changes, it invalidates the snapshots query to trigger a refetch.
 */
export function useSnapshotEvents(options?: UseSnapshotEventsOptions) {
    const { algorithmPreset, enabled = true } = options ?? {}
    const queryClient = useQueryClient()
    const eventSourceRef = useRef<EventSource | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!enabled) {
            return
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

                    if (parsedEvent.type === 'snapshot:updated') {
                        // Invalidate snapshots queries to trigger a refetch
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.snapshots.lists(),
                        })

                        // Also invalidate the specific snapshot detail if it's cached
                        queryClient.invalidateQueries({
                            queryKey: queryKeys.snapshots.detail(
                                parsedEvent.data._id
                            ),
                        })
                    }
                } catch (error) {
                    console.error('Failed to parse snapshot event:', error)
                }
            }

            eventSource.onerror = () => {
                // Connection lost, attempt to reconnect after a delay
                eventSource.close()
                eventSourceRef.current = null

                // Exponential backoff for reconnection
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect()
                }, 5000)
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

