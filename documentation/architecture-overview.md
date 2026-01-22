# Architecture Overview

## Project Structure

```
rattrapage/
|
+-- backend/                 # Node.js Express API
|   +-- src/
|   |   +-- routes/          # API endpoints
|   |   +-- controllers/     # Business logic
|   |   +-- models/          # Data models (types)
|   |   +-- lib/             # Utilities (mongodb, logger, paypal)
|   |   +-- middleware/      # Auth middleware
|   |   +-- scripts/         # Import/cleanup scripts
|   |   +-- __tests__/       # Unit tests
|   |   +-- app.ts           # Express app config
|   |   +-- server.ts        # Server entrypoint
|   +-- Dockerfile           # Multi-stage build
|   +-- tsconfig.json
|   +-- package.json
|
+-- trinity/                 # Next.js Frontend
|   +-- src/
|   |   +-- app/             # Next.js 13 app router
|   |   |   +-- admin/       # Admin pages
|   |   |   +-- shop/        # Redux store
|   |   +-- components/      # Reusable components
|   |   +-- lib/             # API client
|   |   +-- styles/          # CSS modules
|   |   +-- __tests__/       # Unit tests
|   +-- public/              # Static assets
|   +-- Dockerfile           # Multi-stage build
|   +-- next.config.ts
|   +-- tailwind.config.js
|   +-- package.json
|
+-- trinity-mobile/          # React Native Expo
|   +-- src/
|   |   +-- screens/         # App screens
|   |   +-- components/      # Reusable components
|   |   +-- store/           # Redux store
|   |   +-- lib/             # API client
|   |   +-- styles/          # StyleSheet styles
|   |   +-- __tests__/       # Unit tests
|   +-- assets/              # Images, fonts
|   +-- App.tsx              # App entrypoint
|   +-- app.json             # Expo config
|   +-- eas.json             # EAS Build config
|   +-- package.json
|
+-- .github/
|   +-- workflows/
|       +-- security.yml     # Security scanning
|       +-- test.yml         # Tests and coverage
|       +-- deploy-local.yml # Local deployment
|       +-- mobile-deploy.yml# Mobile deployment
|
+-- documentation/           # This folder
+-- docker-compose.yaml      # Dev orchestration
+-- README.md
+-- sonar-project.properties # SonarCloud config
```

## Technology Stack

### Backend
- Runtime: Node.js 20
- Framework: Express.js
- Language: TypeScript
- Database: MongoDB 6
- Authentication: JWT (jsonwebtoken)
- Password: bcrypt
- Logging: Winston
- Testing: Mocha + Chai
- Coverage: nyc

### Frontend Web
- Framework: Next.js 15
- UI Library: React 19
- Language: TypeScript
- Styling: TailwindCSS + DaisyUI
- State: Redux Toolkit + redux-persist
- HTTP Client: Axios
- Charts: Chart.js + react-chartjs-2
- Testing: Jest + React Testing Library
- Payment: @paypal/react-paypal-js

### Mobile
- Framework: React Native (Expo SDK)
- Language: TypeScript
- State: Redux Toolkit
- HTTP Client: Fetch API
- Navigation: @react-navigation
- Camera: expo-camera
- Barcode: expo-barcode-scanner
- Testing: Jest + React Native Testing Library
- Payment: react-native-paypal (via webview)

### DevOps
- CI/CD: GitHub Actions
- Containerization: Docker
- Orchestration: Docker Compose
- Code Quality: SonarCloud
- Coverage: Codecov
- Security: Gitleaks, Trivy, CodeQL
- Runner: Self-hosted Windows

## Architecture Patterns

### Backend - Layered Architecture

```
Routes Layer (Express Router)
    |
    v
Middleware (Auth, Validation)
    |
    v
Controllers (Request/Response handling)
    |
    v
Services (Business logic)
    |
    v
Data Access (MongoDB driver)
    |
    v
Database (MongoDB)
```

### Frontend - Component Architecture

```
Pages (Next.js App Router)
    |
    +-- Layouts (Navbar, Footer)
    |
    +-- Components (ProductCard, UserTable, KPIDashboard)
    |
    +-- Redux Store (Cart, User, Products state)
    |
    +-- API Client (Axios wrapper)
            |
            v
        Backend API
```

### Mobile - MVVM Pattern

```
View (Screens + Components)
    |
    v
ViewModel (Redux Store)
    |
    v
Model (API Client + Services)
    |
    v
Backend API
```

## Data Architecture

### MongoDB Collections

**users**
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password": "$2b$10$hashed...",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678",
  "billing": {
    "address": "123 Rue Example",
    "zipCode": "75001",
    "city": "Paris",
    "country": "France"
  },
  "isAdmin": false,
  "createdAt": ISODate("2026-01-20")
}
```

**products**
```json
{
  "_id": "3017620422003",
  "code": "3017620422003",
  "product_name": "Nutella",
  "brands": "Ferrero",
  "price": 4.99,
  "stock": 150,
  "image_url": "https://...",
  "categories": "Spreads",
  "nutriscore_grade": "e",
  "nutrition_data_per": "100g",
  "energy_100g": 2252,
  "fat_100g": 30.9,
  ...
}
```

**invoices**
```json
{
  "_id": ObjectId,
  "userId": ObjectId("user_id"),
  "paypalOrderId": "7UX12345ABC",
  "items": [
    {
      "productId": "3017620422003",
      "name": "Nutella",
      "quantity": 2,
      "price": 4.99,
      "refunded": false,
      "refundedQuantity": 0
    }
  ],
  "total": 9.98,
  "status": "paid",
  "deliveryStatus": "en preparation",
  "shipping": {
    "name": { "full_name": "John Doe" },
    "address": {
      "address_line_1": "123 Rue Example",
      "admin_area_2": "Paris",
      "postal_code": "75001",
      "country_code": "FR"
    }
  },
  "createdAt": ISODate("2026-01-20"),
  "updatedAt": ISODate("2026-01-20")
}
```

## API Design

RESTful endpoints following standard HTTP methods:

- GET: Retrieve resources
- POST: Create resources
- PUT: Update resources
- DELETE: Delete resources

Authentication: Bearer token in Authorization header

Response format: JSON

Error format:
```json
{
  "error": "Error message"
}
```

## Security Architecture

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Middleware checks user roles
3. **Password storage**: bcrypt hashing (10 rounds)
4. **HTTPS**: All communications encrypted
5. **CORS**: Restricted origins in production
6. **Input validation**: Sanitization at API level
7. **Secrets**: GitHub Secrets for sensitive data
8. **Container isolation**: Docker network separation

## Deployment Architecture

### Development
```
Developer Machine
    |
    +-- Docker Compose
        |
        +-- MongoDB Container (port 27017)
        +-- Backend Container (port 4000)
        +-- Frontend Container (port 3000)
        +-- Mongo Express Container (port 8081)
```

### Production (Local Self-Hosted)
```
Local PC (GitHub Runner)
    |
    +-- Docker Compose
        |
        +-- MongoDB Container (data persisted)
        +-- Backend Container (optimized build)
        +-- Frontend Container (optimized build)
```

### Mobile
```
Expo Build Cloud (EAS)
    |
    +-- Build APK/IPA
    |
    v
Google Play Store / App Store
    |
    v
User Devices
```

## Scalability Considerations

1. **Horizontal scaling**: Multiple backend containers behind load balancer
2. **Database replication**: MongoDB replica set
3. **Caching**: Redis for session/product cache
4. **CDN**: Static assets served from CDN
5. **API rate limiting**: Prevent abuse
6. **Database indexing**: Optimize query performance
7. **Lazy loading**: Frontend code splitting
8. **Image optimization**: Next.js Image component

## Monitoring and Logging

1. **Application logs**: Winston (daily rotation)
2. **Error tracking**: Console errors + log files
3. **Performance**: Next.js Analytics
4. **Uptime**: Health check endpoints
5. **CI/CD metrics**: GitHub Actions insights
6. **Code quality**: SonarCloud dashboard
7. **Coverage**: Codecov reports
