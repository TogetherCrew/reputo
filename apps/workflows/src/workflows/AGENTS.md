# Workflow Code Instructions

- Workflow code must stay deterministic and replay-safe.
- Do not perform direct DB, network, filesystem, random, or wall-clock operations here.
- Use Temporal workflow APIs for timers, cancellation, logging, signals, queries, and activity proxies.
- Keep workflow state explicit and serializable.
- Put all side effects in activities and keep workflow files focused on coordination and state transitions.
