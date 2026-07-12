# {{title}}

Owner: {{owner}}
Status: Draft
Last updated: {{date}}

## Summary

{{one-paragraph technical summary of the change and expected outcome}}

## Context

{{current state, problem, constraints, and why this design is needed}}

## Decision Record

- Status: Proposed
- Decision: {{short statement of the chosen direction when known}}
- Context: {{forces, constraints, and tradeoffs behind the decision}}
- Consequences: {{positive and negative outcomes of this decision}}

## Goals

- {{technical or user-visible goal}}
- {{reliability, performance, security, or operability goal}}

## Non-Goals

- {{explicitly out of scope}}
- {{future work not solved here}}

## Requirements

### Functional Requirements

- {{required behavior}}

### Non-Functional Requirements

- {{performance, reliability, security, privacy, compliance, or operability requirement}}

## Constraints

- Technical: {{existing systems, libraries, interfaces, migration limits, or platform constraints}}
- Product: {{scope, timeline, launch, or compatibility constraints}}
- Operational: {{on-call, support, cost, deployment, or observability constraints}}

## Proposed Design

{{architecture, components, data flow, control flow, and important implementation details}}

## System Context

{{upstream systems, downstream systems, users, external dependencies, and trust boundaries}}

## Runtime Flow

{{request flow, async flow, state transitions, retries, failure handling, and timeout behavior}}

## API, Data, Or Contract Changes

{{schemas, endpoints, events, storage changes, compatibility notes, or migration needs}}

## Architecture Decisions

### ADR 1: {{decision title}}

- Status: Proposed
- Context: {{why the decision is needed}}
- Decision: {{chosen approach}}
- Consequences: {{tradeoffs and follow-up obligations}}

## Alternatives Considered

### Option 1: {{name}}

- Pros: {{benefit}}
- Cons: {{tradeoff}}

### Option 2: {{name}}

- Pros: {{benefit}}
- Cons: {{tradeoff}}

## Risks And Mitigations

- Risk: {{risk}}
  Mitigation: {{mitigation}}

## Quality Attributes

- Reliability: {{availability, durability, failure handling, disaster recovery, or graceful degradation}}
- Security: {{auth, authorization, tenant isolation, secrets, PII, abuse cases, or compliance concerns}}
- Performance: {{latency, throughput, load, scalability, caching, or resource usage}}
- Cost: {{infrastructure, vendor, storage, compute, operational, or maintenance cost}}
- Operability: {{deployment, debugging, support, runbooks, and on-call impact}}

## Observability

{{logs, metrics, traces, dashboards, alerts, and debugging hooks}}

## Security And Privacy

{{auth, authorization, tenant isolation, secrets, PII, abuse cases, or compliance concerns}}

## Test Plan

- Unit: {{unit-level coverage}}
- Integration: {{integration or contract coverage}}
- Manual or smoke: {{manual validation if needed}}

## Rollout And Rollback

{{feature flags, migrations, deploy order, backfill, rollback, and recovery plan}}

## Open Questions

- {{decision or unknown}}

## Next Steps

- {{owner}}: {{action}} by {{date}}
