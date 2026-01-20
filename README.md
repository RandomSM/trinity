# OpenFoodMarket

Application de gestion de produits alimentaires avec scanner de codes-barres.

## Prerequis

- Node.js version 20 ou superieure
- Docker Desktop
- Git

## Structure du projet

- backend : API REST en TypeScript Express
- trinity : Application web Next.js
- trinity-mobile : Application mobile Expo React Native

## Configuration des variables d'environnement

### Backend

Creer le fichier `backend/.env.development` avec les variables suivantes :

```
MONGODB_URI=mongodb://root:92110@localhost:27017/eshop?authSource=admin
MONGODB_DB=eshop
JWT_SECRET=votre_cle_secrete_jwt
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_CLIENT_SECRET=votre_client_secret_paypal
PAYPAL_MODE=sandbox
OPENFOODFACTS_API=https://world.openfoodfacts.org/api/v0
PORT=4000
NODE_ENV=development
```

Pour la production, creer `backend/.env.production` avec les memes variables mais en adaptant :
- MONGODB_URI pour votre base de production
- PAYPAL_MODE=live pour le mode production PayPal
- NODE_ENV=production

### Frontend Web

Creer le fichier `trinity/.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Pour la production :

```
NEXT_PUBLIC_API_URL=https://votre-domaine.com/api
```

### Application Mobile

Modifier le fichier `trinity-mobile/src/lib/api.ts` ligne 4 :

```typescript
const API_URL = 'http://votre-ip-locale:4000';
```

Remplacer `votre-ip-locale` par votre adresse IP locale pour tester sur un appareil physique.

## Lancement avec Docker

### Mode developpement

```powershell
docker-compose up -d
```

Services disponibles :
- Backend API : http://localhost:4000
- Frontend Web : http://localhost:3000
- MongoDB Express : http://localhost:8081
- MongoDB : localhost:27017

### Mode production

```powershell
$env:NODE_ENV="production"
docker-compose up -d
```

### Arreter les services

```powershell
docker-compose down
```

### Supprimer les volumes

```powershell
docker-compose down -v
```

## Lancement sans Docker

### Backend

```powershell
cd backend
npm install
npm run dev
```

Le backend sera disponible sur http://localhost:4000

### Frontend Web

```powershell
cd trinity
npm install
npm run dev
```

Le frontend sera disponible sur http://localhost:3000

### Application Mobile

```powershell
cd trinity-mobile
npm install
npm start
```

Scanner le QR code avec l'application Expo Go sur votre smartphone.

## Scripts disponibles

### Backend

- `npm run dev` : Demarrer en mode developpement avec rechargement automatique
- `npm run build` : Compiler le TypeScript
- `npm start` : Demarrer en mode production
- `npm test` : Executer les tests
- `npm run test:coverage` : Executer les tests avec couverture

### Frontend Web

- `npm run dev` : Demarrer en mode developpement
- `npm run build` : Construire pour la production
- `npm start` : Demarrer en mode production
- `npm test` : Executer les tests
- `npm run test:coverage` : Executer les tests avec couverture

### Application Mobile

- `npm start` : Demarrer le serveur Expo
- `npm run android` : Lancer sur Android
- `npm run ios` : Lancer sur iOS
- `npm run web` : Lancer version web

## Base de donnees

### Connexion MongoDB

Avec Docker :
- Host : localhost
- Port : 27017
- Username : root
- Password : 92110
- Database : eshop

### Interface MongoDB Express

Accessible sur http://localhost:8081 avec les memes identifiants.

## Comptes par defaut

Apres le premier lancement, vous pouvez creer un compte administrateur via l'API :

```powershell
curl -X POST http://localhost:4000/users/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\",\"name\":\"Admin\",\"role\":\"admin\"}'
```

## PayPal Configuration

Pour activer les paiements PayPal :

1. Creer un compte developpeur sur https://developer.paypal.com
2. Creer une application dans le Dashboard
3. Recuperer le Client ID et Client Secret
4. Les ajouter dans le fichier `.env.development` du backend

Mode sandbox pour les tests, mode live pour la production.

## Scanner de codes-barres

L'application mobile utilise l'API Open Food Facts pour recuperer les informations des produits.

Types de codes-barres supportes :
- EAN-13
- EAN-8
- UPC-A
- UPC-E
- Code 128
- Code 39

## Deploiement

### GitHub Actions

Le projet utilise GitHub Actions pour le deploiement automatique.

Variables a configurer dans Settings > Secrets and variables > Actions :

- MONGODB_URI
- JWT_SECRET
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET

### Self-hosted runner

Pour deployer sur votre machine locale :

1. Aller dans Settings > Actions > Runners
2. Cliquer sur New self-hosted runner
3. Suivre les instructions pour Windows
4. Installer le runner en tant que service
5. Pousser sur la branche main ou develop pour declencher le deploiement

## Support

Pour toute question ou probleme, consulter les logs :

```powershell
docker-compose logs backend
docker-compose logs frontend
```

Les logs du backend sont egalement enregistres dans `backend/logs/`.
