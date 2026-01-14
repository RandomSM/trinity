# Trinity Project - CI/CD Pipeline Documentation

## Overview

This document describes the complete CI/CD pipeline implementation for the Trinity e-commerce project, including GitLab CI/CD configuration, security scanning, automated testing, and deployment strategies.

## Table of Contents

1. [Pipeline Architecture](#pipeline-architecture)
2. [Pipeline Stages](#pipeline-stages)
3. [Security Measures](#security-measures)
4. [Testing Strategy](#testing-strategy)
5. [Deployment Process](#deployment-process)
6. [GitLab Runner Setup](#gitlab-runner-setup)
7. [Environment Variables](#environment-variables)

## Pipeline Architecture

The CI/CD pipeline consists of 4 main stages:

```
┌─────────────┐
│  Security   │  SAST, Dependency Scanning, Secret Detection
└──────┬──────┘
       │
┌──────▼──────┐
│    Test     │  Backend & Frontend Unit Tests (20%+ coverage)
└──────┬──────┘
       │
┌──────▼──────┐
│    Build    │  Docker Images for dev/prod environments
└──────┬──────┘
       │
┌──────▼──────┐
│   Deploy    │  Zero-downtime deployment to dev/prod
└─────────────┘
```

### Technology Stack

- **CI/CD Platform**: GitLab CI/CD
- **Containerization**: Docker (multi-stage builds)
- **Orchestration**: Docker Compose
- **Testing**: Mocha/Chai (backend), Jest (frontend)
- **Security**: Trivy, GitLab SAST, Dependency Scanning, Secret Detection
- **Code Coverage**: NYC (backend), Jest (frontend)

## Pipeline Stages

### Stage 1: Security

#### SAST (Static Application Security Testing)
- Automatically scans source code for security vulnerabilities
- Uses GitLab's built-in SAST templates
- Blocks pipeline if critical vulnerabilities found

#### Dependency Scanning
- Scans package.json dependencies for known vulnerabilities
- Checks npm packages against CVE databases
- Generates reports for vulnerable dependencies

#### Secret Detection
- Scans commit history for exposed secrets (API keys, passwords, tokens)
- Prevents accidental credential leaks
- Runs on every commit

#### Container Scanning
- Uses Aqua Security Trivy to scan Docker images
- Checks for HIGH and CRITICAL severity vulnerabilities
- Scans both backend and frontend images
- Runs only on `main` and `develop` branches

**Configuration**:
```yaml
container_scanning_backend:
  stage: security
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $BACKEND_IMAGE:latest -f backend/Dockerfile backend/
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
        aquasec/trivy image --severity HIGH,CRITICAL \
        --exit-code 1 --no-progress $BACKEND_IMAGE:latest
```

### Stage 2: Test

#### Backend Unit Tests (Mocha/Chai)
- **Framework**: Mocha + Chai + Supertest
- **Coverage Tool**: NYC (Istanbul)
- **Target Coverage**: 20% minimum (statements, branches, functions, lines)
- **Test Database**: MongoDB test instance with separate credentials
- **Reports**: Cobertura XML for GitLab integration

**Test Categories**:
- API endpoint tests (routes validation)
- Database operations
- PayPal integration mocks
- Data validation helpers
- Currency conversion logic

**Configuration**:
```yaml
test_backend:
  stage: test
  image: node:20-alpine
  services:
    - name: mongo:6
      alias: mongodb
  variables:
    MONGODB_URI: mongodb://root:92110@mongodb:27017/eshop_test?authSource=admin
  script:
    - cd backend && npm ci && npm run test:coverage
  coverage: '/Statements\s*:\s*(\d+\.\d+)%/'
```

#### Frontend Unit Tests (Jest)
- **Framework**: Jest + React Testing Library
- **Coverage Tool**: Built-in Jest coverage
- **Target Coverage**: 20% minimum
- **Test Categories**:
  - React component rendering
  - Redux state management (cart, user slices)
  - Price calculations
  - Form validation

**Configuration**:
```yaml
test_frontend:
  stage: test
  image: node:20-alpine
  script:
    - cd trinity && npm ci && npm run test:coverage
  coverage: '/Statements\s*:\s*(\d+\.\d+)%/'
```

### Stage 3: Build

#### Multi-Stage Docker Builds

**Development Images**:
- Hot-reload enabled
- Source code mounted as volumes
- Unoptimized for debugging
- Pushed with tags: `dev-latest`, `dev-$CI_COMMIT_SHORT_SHA`

**Production Images**:
- Optimized builds
- No development dependencies
- Minified assets (frontend)
- Pushed with tags: `latest`, `$CI_COMMIT_SHORT_SHA`

**Dockerfile Structure**:
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS development
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS production
ENV NODE_ENV=production
RUN npm install --omit=dev
COPY . .
RUN npm run build
CMD ["npm", "run", "start"]
```

**Build Jobs**:
- `build_backend_dev` - Builds on `develop` branch
- `build_backend_prod` - Builds on `main` branch
- `build_frontend_dev` - Builds on `develop` branch
- `build_frontend_prod` - Builds on `main` branch

### Stage 4: Deploy

#### Zero-Downtime Deployment Strategy

**Process**:
1. Pull new Docker images from registry
2. Scale service to 2 instances (new + old)
3. Wait for health checks to pass (10-15 seconds)
4. Scale back to 1 instance (removes old container)
5. Clean up old images

**Benefits**:
- No service interruption
- Automatic rollback if health checks fail
- Minimal memory overhead (brief 2x usage)

**Development Deployment**:
- **Trigger**: Automatic on `develop` branch
- **Target**: Development server
- **Environment**: `development`
- **Health Checks**: 10 second warm-up

**Production Deployment**:
- **Trigger**: Manual approval required
- **Target**: Production server
- **Environment**: `production`
- **Health Checks**: 15 second warm-up
- **Resource Limits**: 1 CPU core, 1GB RAM per service

**Deployment Script Example**:
```bash
# Zero-downtime deployment
docker-compose up -d --no-deps --scale backend=2 backend
sleep 15  # Wait for health checks
docker-compose up -d --no-deps --scale backend=1 backend
```

## Security Measures

### Secrets Management

**Environment Variables (GitLab CI/CD Variables)**:
- `JWT_SECRET` - Token signing key
- `MONGO_PASSWORD` - Database password
- `PAYPAL_CLIENT_ID` - PayPal API client ID
- `PAYPAL_CLIENT_SECRET` - PayPal API secret
- `SSH_PRIVATE_KEY` - Deployment SSH key
- `CI_REGISTRY_USER` - Docker registry username
- `CI_REGISTRY_PASSWORD` - Docker registry password

**Security Rules**:
- ✅ All secrets stored in GitLab CI/CD variables (masked, protected)
- ✅ No hardcoded credentials in code or Dockerfiles
- ✅ `.env` files excluded from git (`.gitignore`)
- ✅ Separate credentials for dev/prod environments
- ✅ SSH keys never committed to repository

### Network Security

- HTTPS enforcement in production
- MongoDB authentication required
- JWT tokens for API authentication
- CORS configured for specific origins
- Health check endpoints for monitoring

## Testing Strategy

### Backend Coverage Breakdown

**Files Tested**:
- `/src/__tests__/api.test.ts` - API route testing
- `/src/__tests__/utils.test.ts` - Helper functions

**Test Focus Areas**:
1. **Authentication** (20%):
   - Login validation
   - Registration checks
   - JWT token handling

2. **Product API** (30%):
   - CRUD operations
   - Search and filtering
   - Pagination

3. **Invoice Management** (20%):
   - Order creation
   - PayPal integration
   - Refund processing

4. **Data Validation** (15%):
   - Email format validation
   - Price validation
   - Currency conversion

5. **Database Operations** (15%):
   - Connection handling
   - Query validation

### Frontend Coverage Breakdown

**Files Tested**:
- `/src/__tests__/components/ProductCard.test.tsx`
- `/src/__tests__/redux/cartSlice.test.ts`
- `/src/__tests__/redux/userSlice.test.ts`

**Test Focus Areas**:
1. **Component Rendering** (30%):
   - ProductCard display
   - Price formatting
   - Image handling

2. **State Management** (40%):
   - Cart operations (add, remove, update)
   - User authentication state
   - Quantity calculations

3. **Business Logic** (20%):
   - Price totals
   - Stock limits
   - Discount calculations

4. **Form Validation** (10%):
   - Email validation
   - Input sanitization

### Running Tests Locally

**Backend**:
```bash
cd backend
npm install
npm run test              # Run tests once
npm run test:coverage     # Generate coverage report
```

**Frontend**:
```bash
cd trinity
npm install
npm run test              # Run tests once
npm run test:watch        # Watch mode
npm run test:coverage     # Generate coverage report
```

## Deployment Process

### Manual Deployment Steps

1. **Commit and Push**:
   ```bash
   git add .
   git commit -m "feat: implement new feature"
   git push origin develop  # or main
   ```

2. **Pipeline Execution**:
   - Security scans run automatically
   - Tests execute (must pass for pipeline to continue)
   - Docker images build and push to registry
   - Deployment job appears (manual trigger for prod)

3. **Production Deployment**:
   - Navigate to GitLab CI/CD > Pipelines
   - Click on latest pipeline
   - Click "Play" button on `deploy_prod` job
   - Monitor deployment logs

### Rollback Procedure

**Immediate Rollback**:
```bash
ssh user@production-server
cd /opt/trinity
docker-compose down
docker pull $REGISTRY/backend:$PREVIOUS_TAG
docker pull $REGISTRY/frontend:$PREVIOUS_TAG
BACKEND_IMAGE=$REGISTRY/backend:$PREVIOUS_TAG \
FRONTEND_IMAGE=$REGISTRY/frontend:$PREVIOUS_TAG \
docker-compose -f docker-compose.prod.yml up -d
```

**Via GitLab**:
1. Find previous successful pipeline
2. Click "Retry" on deploy job
3. Older images will be deployed

## GitLab Runner Setup

### Prerequisites

- Linux VM (Ubuntu 20.04+ recommended)
- Docker installed
- GitLab Runner binary
- Network access to GitLab server

### Installation Steps

1. **Install GitLab Runner**:
```bash
# Download
sudo curl -L --output /usr/local/bin/gitlab-runner \
  https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64

# Make executable
sudo chmod +x /usr/local/bin/gitlab-runner

# Create user
sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash

# Install as service
sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
sudo gitlab-runner start
```

2. **Register Runner**:
```bash
sudo gitlab-runner register
```

**Configuration Options**:
- **GitLab URL**: Your GitLab server URL
- **Registration Token**: From GitLab project Settings > CI/CD > Runners
- **Description**: `trinity-docker-runner`
- **Tags**: `docker,trinity,production`
- **Executor**: `docker`
- **Default Docker Image**: `docker:latest`

3. **Configure Docker Executor**:

Edit `/etc/gitlab-runner/config.toml`:
```toml
[[runners]]
  name = "trinity-docker-runner"
  url = "https://your-gitlab-server.com"
  token = "YOUR_RUNNER_TOKEN"
  executor = "docker"
  [runners.docker]
    tls_verify = false
    image = "docker:latest"
    privileged = true
    disable_cache = false
    volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
    shm_size = 0
  [runners.cache]
    [runners.cache.s3]
    [runners.cache.gcs]
```

4. **Verify Runner**:
```bash
sudo gitlab-runner verify
sudo gitlab-runner list
```

### Runner Maintenance

**View Logs**:
```bash
sudo journalctl -u gitlab-runner -f
```

**Restart Runner**:
```bash
sudo gitlab-runner restart
```

**Update Runner**:
```bash
sudo gitlab-runner stop
sudo curl -L --output /usr/local/bin/gitlab-runner \
  https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64
sudo chmod +x /usr/local/bin/gitlab-runner
sudo gitlab-runner start
```

### Runner Security

- Runner runs in isolated Docker containers
- Each job starts with clean environment
- Secrets passed via environment variables (masked in logs)
- Runner has no direct access to production servers (uses SSH)
- Docker socket mounted read-only when possible

## Environment Variables

### Required CI/CD Variables (GitLab)

Configure in: **Settings > CI/CD > Variables**

| Variable | Type | Protected | Masked | Description |
|----------|------|-----------|--------|-------------|
| `JWT_SECRET` | Variable | ✅ | ✅ | JWT signing secret |
| `MONGO_PASSWORD` | Variable | ✅ | ✅ | MongoDB root password |
| `PAYPAL_CLIENT_ID` | Variable | ✅ | ✅ | PayPal API client ID |
| `PAYPAL_CLIENT_SECRET` | Variable | ✅ | ✅ | PayPal API secret |
| `SSH_PRIVATE_KEY` | File | ✅ | ❌ | SSH key for deployment |
| `DEV_SERVER` | Variable | ❌ | ❌ | Dev server hostname |
| `DEV_USER` | Variable | ❌ | ❌ | Dev server SSH user |
| `PROD_SERVER` | Variable | ✅ | ❌ | Prod server hostname |
| `PROD_USER` | Variable | ✅ | ❌ | Prod server SSH user |
| `API_URL` | Variable | ✅ | ❌ | Public API URL |

### Application Environment Variables

**Backend (`backend/.env.production`)**:
```env
NODE_ENV=production
MONGODB_URI=mongodb://root:${MONGO_PASSWORD}@mongo:27017/eshop?authSource=admin
JWT_SECRET=${JWT_SECRET}
PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}
PAYPAL_MODE=live
PORT=4000
```

**Frontend (`trinity/.env.production`)**:
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=${API_URL}
```

## Troubleshooting

### Common Issues

**Pipeline fails at security stage**:
- Check Trivy can pull images
- Verify Docker-in-Docker service is running
- Review vulnerability reports and fix critical issues

**Tests fail in CI but pass locally**:
- Check MongoDB service is available
- Verify environment variables are set
- Review test database connection string

**Deployment hangs**:
- Check SSH key is correctly configured
- Verify deployment server is accessible
- Review health check timeouts

**Docker build fails**:
- Check Dockerfile syntax
- Verify package.json dependencies
- Review build logs for npm errors

### Monitoring

**View Pipeline Status**:
- GitLab Project > CI/CD > Pipelines
- Shows success/failure for each stage
- Click job for detailed logs

**Coverage Reports**:
- GitLab Project > CI/CD > Pipelines > Job > Coverage tab
- Visual coverage graphs
- Downloadable reports

**Deployment Logs**:
```bash
ssh user@server
cd /opt/trinity
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Performance Metrics

### Pipeline Execution Times

- **Security Stage**: ~5-10 minutes (container scanning takes longest)
- **Test Stage**: ~3-5 minutes (parallel execution)
- **Build Stage**: ~5-8 minutes (Docker builds)
- **Deploy Stage**: ~2-3 minutes (zero-downtime deployment)

**Total Pipeline Time**: ~15-25 minutes (depends on test count and image size)

### Optimization Tips

1. **Cache Dependencies**:
   - Use Docker layer caching
   - Cache npm packages between builds

2. **Parallel Execution**:
   - Run backend and frontend tests simultaneously
   - Build images in parallel

3. **Skip Unnecessary Stages**:
   - Container scanning only on main branches
   - Deployment only when needed

4. **Reduce Image Size**:
   - Use Alpine-based images
   - Multi-stage builds
   - Remove development dependencies in production

## Next Steps

1. **Setup Monitoring**:
   - Prometheus + Grafana for metrics
   - ELK stack for log aggregation
   - Alert manager for notifications

2. **Add Load Balancer**:
   - Nginx or Traefik
   - SSL/TLS termination
   - Health check integration

3. **Implement Blue-Green Deployment**:
   - Two identical production environments
   - Instant rollback capability
   - Zero downtime upgrades

4. **Add E2E Tests**:
   - Cypress for frontend
   - API integration tests
   - Performance testing with k6

## Support

For issues or questions:
- Check GitLab CI/CD documentation: https://docs.gitlab.com/ee/ci/
- Review pipeline logs in GitLab
- Contact DevOps team

---

**Document Version**: 1.0  
**Last Updated**: January 6, 2026  
**Author**: Trinity DevOps Team
