# Deployment Guide

## Architecture

Denty runs as a containerized Node.js app deployed to Kubernetes:

```
GitHub Push → CI (lint, test, build) → Docker Image → GHCR → Kubernetes
```

## CI/CD Pipelines

### CI (`ci.yml`)
Runs on every push to `main` and all PRs:
1. Install dependencies
2. Biome lint check
3. TypeScript type check
4. Unit tests with coverage
5. Build

### Deploy (`deploy.yml`)
Runs on push to `main` after CI passes:
1. Build Docker image (multi-stage, node:22-alpine)
2. Push to GitHub Container Registry (ghcr.io)
3. Deploy to Kubernetes with rolling update

## Helm Chart

The recommended way to deploy Denty is via the Helm chart in `helm/denty/`.

### Install (first deploy)
```bash
kubectl create namespace denty
helm install denty ./helm/denty \
  --namespace denty \
  --set image.tag=<commit-sha> \
  --set secrets.MONGODB_URI=<your-uri>
```

### Upgrade (subsequent deploys)
```bash
helm upgrade denty ./helm/denty \
  --namespace denty \
  --set image.tag=<commit-sha>
```

### Staging environment
```bash
helm install denty-staging ./helm/denty \
  --namespace denty-staging --create-namespace \
  -f helm/denty/values-staging.yaml \
  --set image.tag=<commit-sha> \
  --set secrets.MONGODB_URI=<staging-uri>
```

### Useful commands
```bash
helm list -n denty                    # List releases
helm history denty -n denty           # Release history
helm rollback denty <revision> -n denty  # Rollback
helm template denty ./helm/denty      # Preview rendered manifests
helm uninstall denty -n denty         # Remove
```

## Raw Kubernetes Manifests

Raw manifests are also available in `k8s/` for reference or non-Helm workflows.

## Kubernetes Setup

### Prerequisites
- A Kubernetes cluster
- `kubectl` access configured
- nginx-ingress controller installed
- cert-manager for TLS (optional but recommended)

### Manifests (`k8s/`)
| File | Purpose |
|------|---------|
| `deployment.yaml` | App pods (2 replicas, health checks, resource limits) |
| `service.yaml` | ClusterIP service exposing port 80 → 3000 |
| `ingress.yaml` | HTTPS ingress with TLS via cert-manager |
| `configmap.yaml` | Non-secret environment variables |
| `secrets.yaml` | Secret template (MongoDB URI, etc.) |

### Configuration

1. **Create namespace**: `kubectl create namespace denty`
2. **Set secrets**: Edit `k8s/secrets.yaml` with base64-encoded values
3. **Configure ingress**: Update hostnames in `k8s/ingress.yaml`
4. **Store kubeconfig**: Add `KUBECONFIG` (base64) as a GitHub Actions secret

## Docker

Build locally:
```bash
docker build -t denty .
docker run -p 3000:3000 denty
```

## Affordable Kubernetes Providers

| Provider | Starting Price | Notes |
|----------|---------------|-------|
| **Hetzner Cloud** | ~€5/mo (CX22) | Best value in EU, great for Spain-targeted app |
| **DigitalOcean** | $12/mo (basic) | Simple managed K8s, good DX |
| **Civo** | $5/mo (small) | K3s-based, fast provisioning |
| **Vultr** | $10/mo | Good global coverage |
| **OVHcloud** | Free control plane + VMs | EU data residency |

### Recommended Setup for Launch
- **Hetzner**: 1 CX22 node (~€5/mo) + load balancer (~€6/mo) = **~€11/mo**
- Add a managed MongoDB (MongoDB Atlas free tier → M10 at $57/mo when needed)
- Total launch cost: **€11-70/mo** depending on database needs

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NODE_ENV` | Yes | `production` |
| `PORT` | No | Default: 3000 |
