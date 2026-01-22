# Installation GitHub Actions Self-Hosted Runner

## Prerequis

- Windows 10/11 ou Windows Server
- PowerShell 5.1 ou superieur
- Git installe
- Docker Desktop installe et demarre

## Etape 1: Creer le runner sur GitHub

1. Aller sur votre repository GitHub
2. Settings > Actions > Runners
3. Cliquer "New self-hosted runner"
4. Selectionner Windows
5. Copier le token d'installation affiche

## Etape 2: Telecharger et installer

```powershell
# Creer dossier actions-runner
mkdir C:\actions-runner
cd C:\actions-runner

# Telecharger runner
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-win-x64-2.311.0.zip -OutFile actions-runner-win-x64-2.311.0.zip

# Extraire archive
Expand-Archive -Path actions-runner-win-x64-2.311.0.zip -DestinationPath .

# Supprimer archive
Remove-Item actions-runner-win-x64-2.311.0.zip
```

## Etape 3: Configurer le runner

```powershell
# Executer configuration
.\config.cmd --url https://github.com/VOTRE_USERNAME/VOTRE_REPO --token VOTRE_TOKEN

# Repondre aux questions:
# - Runner name: self-hosted-windows (ou autre nom)
# - Runner group: Default
# - Labels: self-hosted,Windows,X64
# - Work folder: _work (laisser par defaut)
```

## Etape 4: Installer comme service Windows

```powershell
# Installer service
.\svc.sh install

# Demarrer service
.\svc.sh start

# Verifier status
.\svc.sh status
```

## Etape 5: Verification

1. Retourner sur GitHub Settings > Actions > Runners
2. Verifier que le runner apparait avec status "Idle" (vert)
3. Tester avec un workflow simple

## Configuration Docker

Le runner doit avoir acces a Docker. Verifier:

```powershell
docker ps
docker-compose version
```

Si erreur, ajouter l'utilisateur du service au groupe docker-users:

```powershell
net localgroup docker-users "NT AUTHORITY\NETWORK SERVICE" /add
```

## Gestion du runner

### Arreter le service
```powershell
cd C:\actions-runner
.\svc.sh stop
```

### Redemarrer le service
```powershell
.\svc.sh stop
.\svc.sh start
```

### Desinstaller le service
```powershell
.\svc.sh stop
.\svc.sh uninstall
```

### Reconfigurer avec nouveau token
```powershell
.\svc.sh stop
.\config.cmd remove --token OLD_TOKEN
.\config.cmd --url https://github.com/VOTRE_USERNAME/VOTRE_REPO --token NEW_TOKEN
.\svc.sh install
.\svc.sh start
```

## Troubleshooting

### Runner offline
- Verifier service Windows est demarre
- Verifier connexion internet
- Verifier token n'est pas expire

### Erreur Docker dans workflow
- Verifier Docker Desktop demarre
- Verifier permissions utilisateur service
- Relancer service runner apres installation Docker

### Workflow bloque sur "Waiting for runner"
- Verifier runner est idle (pas occupe)
- Verifier labels workflow matchent labels runner
- Verifier runner n'est pas en maintenance

## Securite

- Ne jamais commit le fichier .credentials
- Ne jamais partager le token d'installation
- Utiliser secrets GitHub pour donnees sensibles
- Runner doit etre sur machine securisee (pas serveur public)

## Maintenance

- Mettre a jour runner regulierement
- Monitorer espace disque (logs et artifacts)
- Nettoyer dossier _work periodiquement

```powershell
# Nettoyer ancien builds
Remove-Item -Recurse -Force C:\actions-runner\_work\*
```

## Logs

Logs du runner:
```
C:\actions-runner\_diag\
```

Logs des workflows:
```
C:\actions-runner\_work\_temp\_runner_file_commands\
```
