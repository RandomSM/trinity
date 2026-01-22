# Choix Technologiques

## Backend

### Node.js + Express + TypeScript
- Ecosysteme mature avec npm
- Performance asynchrone native
- Typage strict pour reduire les erreurs
- Facilite les tests unitaires

### MongoDB
- Schema flexible pour produits Open Food Facts
- Performances elevees pour lecture/ecriture
- Facile a scaler horizontalement
- Integration native avec Node.js

### JWT (jsonwebtoken)
- Stateless authentication
- Pas de stockage session serveur
- Compatible mobile et web
- Standard industrie

## Frontend Web

### Next.js 15 + React 19
- Server-side rendering pour SEO
- Routing automatique file-based
- API routes integrees
- Hot reload rapide avec Turbopack

### TailwindCSS + DaisyUI
- Utility-first CSS rapide
- Composants pre-faits DaisyUI
- Design system coherent
- Bundle size optimise

### Redux Toolkit
- State management predictible
- DevTools pour debugging
- Persistence avec redux-persist
- TypeScript support natif

## Mobile

### React Native + Expo
- Code partage avec web (React)
- OTA updates avec Expo
- Camera API integree
- Build cloud avec EAS
- Support iOS et Android

## DevOps

### GitHub Actions
- Integration native GitHub
- Runners self-hosted gratuit
- Workflows YAML simples
- Marketplace d'actions

### Docker
- Environnements reproductibles
- Isolation des dependances
- Deploiement simplifie
- Multi-stage builds pour optimisation

### SonarCloud
- Analyse qualite code gratuite
- Integration GitHub
- Metriques coverage automatiques

## Raisons des choix

### Pourquoi GitHub au lieu de GitLab
- Gratuit pour projets prives
- GitHub Actions included
- Meilleure integration outils (SonarCloud, Codecov)
- Interface plus intuitive

### Pourquoi MongoDB au lieu de SQL
- Schema produits variable (Open Food Facts)
- Pas de migrations complexes
- JSON native (facilite API REST)
- Performances lecture optimales

### Pourquoi Expo au lieu de React Native CLI
- Setup plus rapide
- Build cloud (pas besoin Xcode/Android Studio local)
- Updates OTA pour corrections rapides
- Camera et barcode scanner integres
