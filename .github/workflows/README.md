# GitHub Actions Workflows - Trinity Project

Ce projet utilise GitHub Actions pour l'intégration continue et le déploiement continu (CI/CD).

## 📋 Workflows Disponibles

### 1. **Security Scanning** (`security.yml`)
Analyse de sécurité automatique à chaque push/PR.

**Inclut:**
- 🔍 **CodeQL** - Analyse statique du code (JavaScript/TypeScript)
- 📦 **Dependency Review** - Vérification des dépendances vulnérables
- 🔑 **TruffleHog** - Détection de secrets dans le code
- 🐳 **Trivy** - Scan de vulnérabilités des conteneurs Docker

### 2. **Test & Coverage** (`test.yml`)
Tests unitaires et couverture de code.

**Jobs:**
- ✅ Backend Tests (Jest + MongoDB)
- ✅ Frontend Tests (Jest + React Testing Library)
- ✅ Mobile Tests (Jest + React Native Testing Library)
- 📊 Upload vers Codecov
- 📈 Résumé de couverture

**Seuils de couverture:**
- Backend: 20%+
- Frontend: 20%+
- Mobile: 20%+

### 3. **Build & Deploy** (`deploy.yml`)
Construction des images Docker et déploiement.

**Environnements:**
- 🟦 **Development** (`develop` branch)
- 🟩 **Production** (`main` branch)
- 💻 **Local PC** (self-hosted runner)

## 🚀 Configuration du Self-Hosted Runner (PC Local)

### Installation sur Windows:

1. **Aller dans Settings → Actions → Runners** de votre repo GitHub
2. **Cliquer "New self-hosted runner"** → Windows
3. **Exécuter les commandes** dans PowerShell (Admin):

```powershell
# Créer le dossier
cd C:\
mkdir actions-runner ; cd actions-runner

# Télécharger le runner
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-win-x64-2.311.0.zip -OutFile actions-runner-win-x64-2.311.0.zip
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner-win-x64-2.311.0.zip", "$PWD")

# Configurer (remplacez TOKEN par celui fourni par GitHub)
.\config.cmd --url https://github.com/VOTRE_USER/VOTRE_REPO --token VOTRE_TOKEN

# Installer comme service Windows
.\svc.sh install
.\svc.sh start
```

### Vérification:
```powershell
# Vérifier le statut
.\svc.sh status

# Voir les logs
Get-Content "C:\actions-runner\_diag\Runner_*.log" -Tail 50
```

## 🔐 Secrets GitHub à Configurer

### Repository Secrets:
Aller dans **Settings → Secrets and variables → Actions**

**Pour le déploiement distant (optionnel):**
```
SSH_PRIVATE_KEY      # Clé SSH pour connexion aux serveurs
```

**Pour Codecov (optionnel):**
```
CODECOV_TOKEN        # Token d'API Codecov (pour les repos privés)
```

### Variables d'Environnement:
Aller dans **Settings → Secrets and variables → Actions → Variables**

**Pour déploiement dev (optionnel):**
```
DEV_SERVER           # IP ou domaine du serveur dev (ex: 192.168.1.100)
DEV_USER             # Utilisateur SSH (ex: deploy)
```

**Pour déploiement prod (optionnel):**
```
PROD_SERVER          # IP ou domaine du serveur prod
PROD_USER            # Utilisateur SSH
```

## 📦 Images Docker (GitHub Container Registry)

Les images sont publiées automatiquement sur `ghcr.io`:

```bash
# Images Development
ghcr.io/VOTRE_USER/VOTRE_REPO/backend:dev-latest
ghcr.io/VOTRE_USER/VOTRE_REPO/frontend:dev-latest

# Images Production
ghcr.io/VOTRE_USER/VOTRE_REPO/backend:latest
ghcr.io/VOTRE_USER/VOTRE_REPO/frontend:latest
```

### Pull des images:
```bash
# Se connecter
echo $GITHUB_TOKEN | docker login ghcr.io -u VOTRE_USER --password-stdin

# Pull
docker pull ghcr.io/VOTRE_USER/VOTRE_REPO/backend:latest
docker pull ghcr.io/VOTRE_USER/VOTRE_REPO/frontend:latest
```

## 🔄 Déclenchement des Workflows

### Automatique:
- **Push** sur `main` ou `develop` → Tous les workflows
- **Pull Request** → Tests et sécurité uniquement

### Manuel:
- Aller dans **Actions** → Choisir un workflow → **Run workflow**

## 📊 Badges pour README

Ajoutez ces badges dans votre `README.md`:

```markdown
![Security](https://github.com/VOTRE_USER/VOTRE_REPO/actions/workflows/security.yml/badge.svg)
![Tests](https://github.com/VOTRE_USER/VOTRE_REPO/actions/workflows/test.yml/badge.svg)
![Deploy](https://github.com/VOTRE_USER/VOTRE_REPO/actions/workflows/deploy.yml/badge.svg)
[![codecov](https://codecov.io/gh/VOTRE_USER/VOTRE_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/VOTRE_USER/VOTRE_REPO)
```

## 🐛 Debugging

### Voir les logs:
1. Aller dans **Actions**
2. Cliquer sur un workflow run
3. Cliquer sur un job pour voir les logs détaillés

### Tester localement avec `act`:
```bash
# Installer act (https://github.com/nektos/act)
choco install act-cli

# Lister les workflows
act -l

# Exécuter un workflow
act push -j test-backend
```

## 📝 Différences avec GitLab CI

| Feature | GitLab CI | GitHub Actions |
|---------|-----------|----------------|
| Config | `.gitlab-ci.yml` | `.github/workflows/*.yml` |
| Runners | GitLab Runner | GitHub Actions Runner |
| Registry | GitLab Registry | GitHub Container Registry (ghcr.io) |
| Secrets | CI/CD Variables | Secrets + Variables |
| Services | `services:` | `services:` (identique) |
| Cache | `cache:` | `actions/cache` |
| Artifacts | `artifacts:` | `actions/upload-artifact` |

## 🎯 Workflow de Développement Recommandé

1. **Feature branch** → Créer une branche `feature/xyz`
2. **Commit + Push** → Tests automatiques se lancent
3. **Pull Request** → Code review + sécurité
4. **Merge vers `develop`** → Build dev + déploiement dev
5. **Merge vers `main`** → Build prod + déploiement local/prod

## 🔧 Maintenance

### Mettre à jour le runner:
```powershell
cd C:\actions-runner
.\svc.sh stop
# Télécharger nouvelle version
.\svc.sh start
```

### Logs du runner:
```powershell
Get-Content "C:\actions-runner\_diag\Runner_*.log" -Tail 100
```

### Nettoyer les anciennes images:
Le déploiement le fait automatiquement avec `docker image prune -f`

## 📚 Documentation Officielle

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Self-Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
