# Architecture CI/CD

## Vue d'ensemble

Le pipeline CI/CD est compose de 3 workflows principaux executant des jobs en parallele et sequentiels.

## Workflows

### 1. Security Scanning (security.yml)

**Declenchement:**
- Push sur main, dev
- Pull requests

**Jobs:**

1. **codeql** - Analyse statique du code
   - Scanne JavaScript et TypeScript
   - Detecte vulnerabilites potentielles
   - Upload resultats GitHub Security

2. **dependency-review** - Revue dependances (PR uniquement)
   - Verifie nouvelles dependances
   - Bloque si severite high

3. **secret-scan** - Detection secrets
   - Gitleaks scanne commits
   - Detecte tokens, passwords, API keys

4. **trivy-backend** - Scan image Docker backend
   - Build image Docker
   - Scanne vulnerabilites CVE
   - Upload resultats SARIF

5. **trivy-frontend** - Scan image Docker frontend
   - Build image Docker
   - Scanne vulnerabilites CVE
   - Upload resultats SARIF

6. **security-audit** - Audit npm
   - npm audit backend
   - npm audit frontend
   - npm audit mobile

### 2. Test & Coverage (test.yml)

**Declenchement:**
- Push sur main, develop
- Pull requests

**Jobs:**

1. **test-backend** - Tests backend
   - MongoDB service container
   - npm ci pour dependances
   - npm run test:coverage
   - Upload coverage Codecov
   - Archive artifacts coverage

2. **test-frontend** - Tests frontend
   - npm ci pour dependances
   - npm run test:coverage
   - Upload coverage Codecov
   - Archive artifacts coverage

3. **test-mobile** - Tests mobile
   - npm ci pour dependances
   - npm test -- --coverage
   - Upload coverage Codecov
   - Archive artifacts coverage

4. **coverage-summary** - Resume coverage
   - Depends: test-backend, test-frontend, test-mobile
   - Download tous les artifacts
   - Affiche resume dans GitHub Summary

5. **sonarcloud** - Analyse qualite code
   - Depends: test-backend, test-frontend, test-mobile
   - Download coverage artifacts
   - Scan SonarCloud avec coverage

### 3. Deploy Local (deploy-local.yml)

**Declenchement:**
- Push sur main uniquement
- Workflow dispatch manuel
- Apres succes Security et Test (workflow_run)

**Condition execution:**
- Bloque si Security ou Test echouent
- Permet bypass manuel via workflow_dispatch

**Jobs:**

1. **deploy-local** - Deploiement PC local
   - Runs-on: self-hosted (runner GitHub Actions local)
   - docker-compose down (stop containers)
   - docker-compose pull (images si registry)
   - docker-compose up -d --build (rebuild et start)
   - docker image prune -f (cleanup)
   - docker ps (verification)

### 4. Mobile Deploy (mobile-deploy.yml)

**Declenchement:**
- Push sur main (path: trinity-mobile/**)
- Pull requests
- Workflow dispatch manuel
- Apres succes Security et Test (workflow_run)

**Jobs:**

1. **publish** - Publication Expo
   - Setup Node.js 20
   - npm ci --legacy-peer-deps
   - expo publish (OTA update)

2. **build** - Build APK Android
   - Uniquement sur main
   - Depends: publish
   - Setup EAS
   - eas build --platform android

## Flux de donnees

```
Push/PR sur main/dev
        |
        v
    +---+---+
    |       |
    v       v
Security  Tests
    |       |
    +---+---+
        |
        v (si succes ET main)
    +---+---+
    |       |
    v       v
Deploy   Mobile
Local    Deploy
```

## Secrets utilises

- MONGODB_URI
- JWT_SECRET
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- EXPO_TOKEN
- SONAR_TOKEN
- GITHUB_TOKEN (auto)

## Points cles

1. **Parallelisation** - Security et Tests run en parallele
2. **Blocking** - Deploy bloque si tests echouent
3. **Artifacts** - Coverage reports conserves 7 jours
4. **Self-hosted runner** - Deploy sur PC local sans serveur cloud
5. **Zero downtime** - docker-compose down puis up rapide
6. **Branch protection** - Deploy uniquement sur main
