import { beforeAll, afterAll } from 'vitest'

// Keep global test environment predictable.
// Add any polyfills or global config here (e.g., TextEncoder in Node <18).

beforeAll(() => {
    process.env.NODE_ENV = 'test'
    // If you want deterministic timestamps across runs, uncomment:
    // vi.useFakeTimers()
    // vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
})

afterAll(() => {
    // vi.useRealTimers()
})
