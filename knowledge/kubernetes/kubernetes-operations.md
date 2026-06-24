# Kubernetes Operations Knowledge

Use this reference when designing, reviewing, or troubleshooting Kubernetes deployments, services, probes, resources, autoscaling, networking, secrets, and rollout behavior.

## Workload Design

- Define CPU and memory requests for scheduling and limits only when the failure mode is understood.
- Add readiness probes for traffic eligibility and liveness probes for stuck-process recovery. Do not use liveness to hide slow startup; use startup probes when startup is long.
- Handle SIGTERM gracefully and make shutdown drain in-flight requests or jobs before the grace period expires.
- Keep containers stateless. Persist durable state in managed storage or backing services.
- Use Deployments for stateless services, Jobs/CronJobs for finite work, and StatefulSets only when stable identity or ordered storage is required.

## Configuration And Secrets

- Use ConfigMaps for non-sensitive configuration and Secrets for sensitive values, but remember Kubernetes Secrets need encryption and RBAC controls to be truly protected.
- Avoid baking environment-specific config into images.
- Validate required config at startup and fail fast with a clear message.

## Rollouts And Reliability

- Use rolling update settings that preserve capacity during deployment.
- Set PodDisruptionBudgets for services that require minimum availability during node maintenance.
- Avoid high-cardinality labels on metrics, logs, and Kubernetes objects.
- Keep health endpoints cheap and dependency-aware: readiness can depend on required dependencies; liveness should usually check only process health.

## Security

- Use least-privilege service accounts and RBAC.
- Run containers as non-root where practical, drop unnecessary Linux capabilities, and avoid privileged pods.
- Scope network access with NetworkPolicies when the cluster supports them.
- Pin image tags by immutable digest for high-risk services.

## Source Notes

- Kubernetes probes: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- Kubernetes resource management: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
- Kubernetes security checklist: https://kubernetes.io/docs/concepts/security/security-checklist/
- Kubernetes workloads overview: https://kubernetes.io/docs/concepts/workloads/
