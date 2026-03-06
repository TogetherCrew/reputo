# Workflows Instructions

- Keep runtime boundaries clear: `src/workflows` coordinates, `src/activities` performs side effects, `src/workers` bootstraps workers, and `src/shared` holds shared types and helpers.
- Put DB, network, storage, and other external I/O in activities, not in workflow orchestration.
- Keep activity inputs and outputs explicit, and handle retries, timeouts, and cancellation intentionally.
- When orchestration or activity behavior changes, update the corresponding workflow or activity tests.
