# Differences Dev vs Prod

## Docker

### Development
- Target: development dans Dockerfile
- Volumes montes (hot reload)
- npm run dev
- Source maps activees
- Logs verbeux

### Production
- Target: production dans Dockerfile
- Code compile dans image
- npm run start
- Code minifie et optimise
- Logs minimaux

## Backend

### Development
- NODE_ENV=development
- nodemon pour auto-restart
- Stack traces completes
- CORS permissif
- MongoDB localhost possible

### Production
- NODE_ENV=production
- pm2 ou node direct
- Error handling generique
- CORS strict origins
- MongoDB via service name

## Frontend

### Development
- next dev --turbopack
- Fast refresh
- ESLint strict
- Source maps
- Non optimise

### Production
- next build puis next start
- Static generation
- ESLint ignore during builds
- Pas de source maps
- Bundle optimise et compresse

## Mobile

### Development
- expo start
- Development build
- Hot reload
- Debugger accessible
- Profiling tools

### Production
- eas build
- Production build
- Pas de hot reload
- Debugger desactive
- Code obfusque

## Base de donnees

### Development
- Volume: mongo-data-dev
- Pas de replication
- Backup optionnel
- Indexes optionnels

### Production
- Volume: mongo-data-prod
- Replication recommandee
- Backup automatique quotidien
- Indexes obligatoires

## Environment Variables

### Development (.env.development)
```
MONGODB_URI=mongodb://root:92110@mongo:27017/eshop
JWT_SECRET=dev_secret_key
PAYPAL_MODE=sandbox
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Production (.env.production)
```
MONGODB_URI=mongodb://root:${SECURE_PASSWORD}@mongo:27017/eshop
JWT_SECRET=${SECURE_JWT_SECRET}
PAYPAL_MODE=live
NEXT_PUBLIC_API_URL=https://api.production.com
```

## Ports

### Development
- Backend: 4000
- Frontend: 3000
- MongoDB: 27017
- Mongo Express: 8081

### Production
- Backend: 4000 (reverse proxy NGINX devant)
- Frontend: 3000 (reverse proxy NGINX devant)
- MongoDB: 27017 (non expose publiquement)
- Mongo Express: desactive

## Securite

### Development
- Secrets en clair dans .env
- HTTPS optionnel
- Authentication relachee
- Rate limiting desactive

### Production
- Secrets dans GitHub Secrets
- HTTPS obligatoire
- Authentication stricte
- Rate limiting actif

## Logs

### Development
- Console.log partout
- Pas de rotation
- Pas de persistence

### Production
- Winston avec rotation
- Fichiers logs conserves 30 jours
- Logs persistes dans volumes Docker

## Tests

### Development
- npm test en local
- Coverage optionnel
- Pas de CI

### Production
- Tests automatiques dans CI
- Coverage obligatoire > 20%
- Blocage si tests echouent

## Deployment

### Development
- docker-compose up local
- Pas de CI/CD
- Deploy manuel

### Production
- GitHub Actions automatique
- Tests puis deploy
- Rollback possible via Git
