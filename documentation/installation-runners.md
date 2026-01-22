# Installation GitHub Actions Self-Hosted Runner (Linux)

## Prerequis

- Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+, ou autre distribution moderne)
- Bash shell
- Git installe
- Docker installe et demarre
- Utilisateur avec privileges sudo

## Etape 1: Creer le runner sur GitHub

1. Aller sur votre repository GitHub
2. Settings > Actions > Runners
3. Cliquer "New self-hosted runner"
4. Selectionner Linux
5. Copier le token d'installation affiche

## Etape 2: Installer les dependances

```bash
# Mettre a jour le systeme
sudo apt update && sudo apt upgrade -y

# Installer dependances necessaires
sudo apt install -y curl wget git

# Installer Docker si pas deja fait
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Appliquer les changements de groupe
newgrp docker

# Verifier Docker
docker --version
docker ps
```

## Etape 3: Telecharger et installer le runner

```bash
# Creer dossier actions-runner
mkdir ~/actions-runner && cd ~/actions-runner

# Telecharger la derniere version du runner Linux x64
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Optionnel: Valider le hash
echo "29fc8cf2dab4c195bb147384e7e2c94cfd4d4022c793b346a6175435265aa278  actions-runner-linux-x64-2.311.0.tar.gz" | shasum -a 256 -c

# Extraire l'archive
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Supprimer l'archive
rm actions-runner-linux-x64-2.311.0.tar.gz
```

## Etape 4: Configurer le runner

```bash
# Executer la configuration
./config.sh --url https://github.com/VOTRE_USERNAME/VOTRE_REPO --token VOTRE_TOKEN

# Repondre aux questions:
# - Runner name: self-hosted-linux (ou autre nom)
# - Runner group: Default
# - Labels: self-hosted,Linux,X64
# - Work folder: _work (laisser par defaut)
```

## Etape 5: Installer comme service systemd

```bash
# Installer le service
sudo ./svc.sh install

# Demarrer le service
sudo ./svc.sh start

# Verifier le status
sudo ./svc.sh status

# Activer au demarrage
sudo systemctl enable actions.runner.$(basename $(pwd)).service
```

## Etape 6: Verification

1. Retourner sur GitHub Settings > Actions > Runners
2. Verifier que le runner apparait avec status "Idle" (vert)
3. Tester avec un workflow simple

```bash
# Verifier les logs du service
sudo journalctl -u actions.runner.*.service -f

# Verifier le statut
sudo systemctl status actions.runner.*.service
```

## Configuration Docker Compose

Installer Docker Compose si necessaire:

```bash
# Telecharger Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre executable
sudo chmod +x /usr/local/bin/docker-compose

# Verifier installation
docker-compose --version
```

## Gestion du runner

### Verifier le status
```bash
cd ~/actions-runner
sudo ./svc.sh status
```

### Arreter le service
```bash
sudo ./svc.sh stop
```

### Demarrer le service
```bash
sudo ./svc.sh start
```

### Redemarrer le service
```bash
sudo ./svc.sh stop
sudo ./svc.sh start
```

### Desinstaller le service
```bash
sudo ./svc.sh stop
sudo ./svc.sh uninstall
```

### Reconfigurer avec nouveau token
```bash
cd ~/actions-runner
sudo ./svc.sh stop
./config.sh remove --token OLD_TOKEN
./config.sh --url https://github.com/VOTRE_USERNAME/VOTRE_REPO --token NEW_TOKEN
sudo ./svc.sh install
sudo ./svc.sh start
```

## Troubleshooting

### Runner offline
```bash
# Verifier le service
sudo systemctl status actions.runner.*.service

# Verifier les logs
sudo journalctl -u actions.runner.*.service -n 50

# Redemarrer le service
sudo systemctl restart actions.runner.*.service
```

### Erreur Docker dans workflow
```bash
# Verifier Docker daemon
sudo systemctl status docker

# Verifier permissions
docker ps

# Si erreur permission, ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $(whoami)
newgrp docker

# Redemarrer le runner
cd ~/actions-runner
sudo ./svc.sh restart
```

### Workflow bloque sur "Waiting for runner"
- Verifier runner est idle: `sudo ./svc.sh status`
- Verifier labels workflow matchent labels runner
- Verifier runner n'est pas en maintenance sur GitHub

### Probleme de permissions
```bash
# Verifier proprietaire des fichiers
ls -la ~/actions-runner

# Corriger permissions si necessaire
sudo chown -R $(whoami):$(whoami) ~/actions-runner
chmod +x ~/actions-runner/*.sh
```

## Securite

- Ne jamais commit le fichier .credentials ou .runner
- Ne jamais partager le token d'installation
- Utiliser secrets GitHub pour donnees sensibles
- Runner doit etre sur machine securisee (pas serveur public)
- Configurer firewall pour limiter acces reseau

```bash
# Exemple configuration UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Maintenance

### Mettre a jour le runner
```bash
cd ~/actions-runner
sudo ./svc.sh stop
./config.sh remove --token VOTRE_TOKEN
# Telecharger nouvelle version
curl -o actions-runner-linux-x64-VERSION.tar.gz -L https://github.com/actions/runner/releases/download/vVERSION/actions-runner-linux-x64-VERSION.tar.gz
tar xzf ./actions-runner-linux-x64-VERSION.tar.gz
rm actions-runner-linux-x64-VERSION.tar.gz
./config.sh --url https://github.com/VOTRE_USERNAME/VOTRE_REPO --token NOUVEAU_TOKEN
sudo ./svc.sh install
sudo ./svc.sh start
```

### Nettoyer espace disque
```bash
# Nettoyer ancien builds
cd ~/actions-runner
rm -rf _work/*

# Nettoyer images Docker non utilisees
docker system prune -a --volumes -f

# Verifier espace disque
df -h
du -sh ~/actions-runner/_work
```

### Monitorer ressources
```bash
# Utilisation CPU/RAM
top

# Espace disque
df -h

# Logs runner
sudo journalctl -u actions.runner.*.service --since today
```

## Logs

### Logs du service systemd
```bash
sudo journalctl -u actions.runner.*.service -f
```

### Logs du runner
```bash
cd ~/actions-runner
tail -f _diag/Runner_*.log
```

### Logs des workflows
```bash
ls -la ~/actions-runner/_work/_temp/
```

## Configuration avancee

### Augmenter limite fichiers ouverts
```bash
# Editer /etc/security/limits.conf
sudo nano /etc/security/limits.conf

# Ajouter:
* soft nofile 65536
* hard nofile 65536

# Redemarrer
sudo reboot
```

### Configurer variables d'environnement
```bash
# Editer le fichier .env du runner
nano ~/actions-runner/.env

# Exemple:
export PATH=/usr/local/bin:$PATH
export NODE_OPTIONS=--max-old-space-size=4096
```
