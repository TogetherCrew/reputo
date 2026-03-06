# API Instructions

- Keep Nest features layered: controllers map HTTP, services own business logic, repositories own persistence and queries.
- Follow the existing feature structure: `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `dto/`, and `*.module.ts`.
- Validate inbound request data at the DTO boundary using the existing Nest validation patterns.
- Keep HTTP concerns at the edge. Services may raise domain errors; controllers and filters should translate them into HTTP responses.
- When endpoint behavior or request/response contracts change, update the relevant unit or e2e tests.
