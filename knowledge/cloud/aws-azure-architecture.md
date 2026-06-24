# AWS And Azure Architecture Knowledge

Use this reference when planning, reviewing, or operating infrastructure on AWS or Azure, especially with Kubernetes, managed databases, queues, storage, identity, networking, observability, and reliability tradeoffs.

## Architecture Principles

- Start from workload requirements: user impact, availability target, data criticality, compliance, latency, and recovery objectives.
- Prefer managed services for undifferentiated operational work when they meet cost, control, and portability needs.
- Design for failure: multi-AZ or zone-redundant placement, backup/restore tests, retry budgets, graceful degradation, and clear rollback.
- Keep identity and access least-privilege. Use workload identity or managed identity instead of long-lived static cloud keys where possible.
- Separate environments and accounts/subscriptions strongly enough that staging mistakes cannot affect production.

## AWS Notes

- Use IAM roles, short-lived credentials, and resource policies instead of embedding access keys.
- For EKS, prefer IAM Roles for Service Accounts or EKS Pod Identity for pod-level AWS permissions.
- Put production services in private subnets unless direct public exposure is required.
- Use CloudWatch, CloudTrail, and service-native metrics/logs for minimum audit and operational visibility.

## Azure Notes

- Use Microsoft Entra ID and managed identities for service authentication where possible.
- For AKS, prefer workload identity for Azure resource access instead of static secrets.
- Use Azure Monitor, Container Insights, Activity Logs, and diagnostic settings for baseline observability.
- Use availability zones and zone-redundant managed services where the workload requires regional resilience.

## Kubernetes On Cloud

- Treat cluster upgrades, node image updates, ingress controllers, autoscalers, and CSI drivers as production dependencies.
- Define ownership for cloud resources provisioned outside Kubernetes and Kubernetes resources that bind to cloud resources.
- Keep network, DNS, certificate, and identity configuration explicit in the deployment plan.
- Validate backup and restore for databases and persistent volumes; a backup that has never been restored is only an assumption.

## Source Notes

- AWS Well-Architected Framework: https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html
- AWS EKS best practices: https://aws.github.io/aws-eks-best-practices/
- Azure Well-Architected Framework: https://learn.microsoft.com/azure/well-architected/
- Azure Kubernetes Service best practices: https://learn.microsoft.com/azure/aks/best-practices
