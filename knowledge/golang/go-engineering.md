# Go Engineering Knowledge

Use this reference when writing or reviewing Go services, APIs, CLIs, workers, libraries, tests, and utilities.

## Code Shape

- Keep package names short, lowercase, and meaningful at the call site.
- Prefer small interfaces owned by the consumer package. Do not create broad interfaces just to mock a concrete type.
- Make dependencies explicit through constructors or parameters; avoid hidden global state except for immutable package-level constants.
- Return early for error paths and keep the happy path left-aligned.
- Keep exported names, comments, and errors useful to callers. Export only what another package genuinely needs.

## Errors And Context

- Return errors instead of panicking in application code. Panic only for programmer errors or process-level unrecoverable failures.
- Wrap errors with operation context using `%w` when callers may need `errors.Is` or `errors.As`.
- Do not log and return the same error unless the log adds boundary context that the caller cannot add.
- Pass `context.Context` as the first parameter for request-scoped work, cancellation, deadlines, and outbound calls.
- Respect context cancellation in loops, retries, database calls, HTTP clients, and goroutines.

## Concurrency

- Prefer simple synchronous code until concurrency is required for latency, throughput, or isolation.
- Own goroutine lifetimes. Every goroutine should have a cancellation path and a bounded channel or wait group strategy.
- Avoid unbounded worker creation, unbounded queues, and shared mutable maps without synchronization.
- Use channels for ownership transfer or coordination, not as a default substitute for clear function calls.

## Tests

- Use table-driven tests for branches, parsers, validators, mapping logic, and edge cases.
- Run subtests with descriptive names and keep assertions close to the behavior being tested.
- Use `httptest` for HTTP handlers and clients; avoid real network calls in unit tests.
- Run with `go test ./...`; use `-race` for concurrency-heavy changes when practical.

## Source Notes

- Effective Go: https://go.dev/doc/effective_go
- Go Code Review Comments: https://go.dev/wiki/CodeReviewComments
- Go blog on context: https://go.dev/blog/context
- Go testing package docs: https://pkg.go.dev/testing
