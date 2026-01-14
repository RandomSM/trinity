# Quick Start Guide - Testing Your Implementation

## 🚀 Quick Test Commands

### 1. Test Backend Unit Tests
```powershell
cd C:\Users\samuel\Documents\rattrapage\backend
npm run test
```

**Expected Output:**
```
API Health Check
  ✓ should respond to GET /products

Products API
  ✓ should return products list or require authentication
  ✓ should support pagination with limit parameter
  ...

40+ passing tests
```

### 2. Test Frontend Unit Tests
```powershell
cd C:\Users\samuel\Documents\rattrapage\trinity
npm run test
```

**Expected Output:**
```
PASS src/__tests__/components/ProductCard.test.tsx
PASS src/__tests__/redux/cartSlice.test.ts
PASS src/__tests__/redux/userSlice.test.ts

Test Suites: 3 passed, 3 total
Tests:       35+ passed, 35+ total
```

### 3. Generate Coverage Reports
```powershell
# Backend coverage
cd C:\Users\samuel\Documents\rattrapage\backend
npm run test:coverage

# Frontend coverage
cd C:\Users\samuel\Documents\rattrapage\trinity
npm run test:coverage
```

**View Reports:**
- Backend: Open `backend/coverage/lcov-report/index.html` in browser
- Frontend: Open `trinity/coverage/lcov-report/index.html` in browser

### 4. Generate KPIs (First Time)
```powershell
# Make sure backend is running
cd C:\Users\samuel\Documents\rattrapage\backend
npm run dev

# In another terminal, call the API
curl -X POST http://localhost:4000/reports/update-kpis
```

**Expected Response:**
```json
{
  "success": true,
  "message": "KPIs updated successfully",
  "kpis": {
    "avgPurchaseValue": 45.67,
    "totalPurchases30Days": 123,
    "topProducts": [...],
    ...
  }
}
```

### 5. View KPI Dashboard
1. Start frontend: `npm run dev` in trinity folder
2. Login as admin at http://localhost:3000/login
3. Click "KPIs" button in navbar
4. View charts and metrics at http://localhost:3000/admin/dashboard

### 6. Check Trending Products on Homepage
1. Go to http://localhost:3000
2. Scroll down to see "Produits Tendances" section
3. Products should have red "🔥 X vendus" badges

## 🔍 Verify Files Were Created

### Run this in PowerShell:
```powershell
cd C:\Users\samuel\Documents\rattrapage

# Check CI/CD files
Test-Path .\.gitlab-ci.yml
Test-Path .\docker-compose.dev.yml
Test-Path .\docker-compose.prod.yml

# Check backend test files
Test-Path .\backend\src\__tests__\api.test.ts
Test-Path .\backend\src\__tests__\utils.test.ts
Test-Path .\backend\.nycrc.json

# Check frontend test files
Test-Path .\trinity\src\__tests__\components\ProductCard.test.tsx
Test-Path .\trinity\src\__tests__\redux\cartSlice.test.ts
Test-Path .\trinity\src\__tests__\redux\userSlice.test.ts
Test-Path .\trinity\jest.config.js

# Check documentation
Test-Path .\docs\CICD-Pipeline-Documentation.md
Test-Path .\docs\Implementation-Summary.md
```

**All should return:** `True`

## 📊 Expected Coverage

### Backend Coverage Target: 20%+
Check with: `npm run test:coverage` in backend folder

**Key Metrics:**
- Statements: >20%
- Branches: >20%
- Functions: >20%
- Lines: >20%

### Frontend Coverage Target: 20%+
Check with: `npm run test:coverage` in trinity folder

**Key Metrics:**
- Statements: >20%
- Branches: >20%
- Functions: >20%
- Lines: >20%

## 🐛 Troubleshooting

### Backend Tests Fail with MongoDB Error
**Problem:** Can't connect to MongoDB  
**Solution:** Make sure MongoDB is running
```powershell
docker-compose up -d mongo
```

### Frontend Tests Fail with Module Error
**Problem:** Missing dependencies  
**Solution:** Reinstall packages
```powershell
cd trinity
Remove-Item -Recurse -Force node_modules
npm install
```

### KPI API Returns 404
**Problem:** No KPI data in database  
**Solution:** Generate KPIs first
```powershell
curl -X POST http://localhost:4000/reports/update-kpis
```

### Trending Products Not Showing on Homepage
**Problem:** No KPI data  
**Solution:**
1. Generate KPIs: `curl -X POST http://localhost:4000/reports/update-kpis`
2. Refresh homepage
3. Check browser console for errors

### Coverage Too Low
**Problem:** Coverage below 20%  
**Solution:** Tests are designed to meet 20%+ target. If failing:
- Ensure all test files are present
- Run with `--verbose` flag
- Check for TypeScript errors

## ✅ Success Checklist

Before presenting/deploying, verify:

- [ ] Backend tests pass (40+ tests)
- [ ] Frontend tests pass (35+ tests)
- [ ] Backend coverage >20%
- [ ] Frontend coverage >20%
- [ ] `.gitlab-ci.yml` exists and is valid
- [ ] Docker compose files for dev/prod exist
- [ ] KPI endpoint returns data
- [ ] Admin dashboard shows charts
- [ ] Homepage shows trending products
- [ ] All documentation files present

## 🎯 Demo Script

### For Presentation:

1. **Show CI/CD Pipeline:**
   - Open `.gitlab-ci.yml`
   - Explain stages: Security → Test → Build → Deploy
   - Show security scanning configuration
   - Show zero-downtime deployment

2. **Run Tests:**
   ```powershell
   cd backend; npm run test:coverage
   cd ..\trinity; npm run test:coverage
   ```
   - Show coverage reports in browser
   - Highlight >20% coverage

3. **Show KPIs:**
   - Generate KPIs: `curl -X POST http://localhost:4000/reports/update-kpis`
   - Open admin dashboard: http://localhost:3000/admin/dashboard
   - Show charts: Revenue trend, Top products, Order distribution
   - Show KPI cards: Average purchase, Total orders, Customers, Revenue

4. **Show Homepage Integration:**
   - Open http://localhost:3000
   - Point out trending products with badges
   - Show KPI stats in hero section
   - Explain automatic updates from KPI system

5. **Show Documentation:**
   - Open `docs/CICD-Pipeline-Documentation.md`
   - Show pipeline architecture diagram
   - Explain security measures
   - Show GitLab runner setup guide

## 📞 Support

If anything doesn't work:
1. Check that all dependencies are installed
2. Verify MongoDB is running
3. Check console/terminal for errors
4. Review test output for failures
5. Ensure ports 3000 and 4000 are free

## 🎉 What You've Built

### Complete CI/CD Pipeline
- ✅ 4 stages with security scanning
- ✅ Automated tests on every commit
- ✅ Zero-downtime deployment
- ✅ Multi-environment support (dev/prod)

### Comprehensive Testing
- ✅ 40+ backend tests (Mocha/Chai)
- ✅ 35+ frontend tests (Jest/React Testing Library)
- ✅ 20%+ code coverage on both
- ✅ Coverage reports integrated with CI

### Full KPIs System
- ✅ 5 KPIs calculated and stored
- ✅ Admin dashboard with interactive charts
- ✅ Homepage with trending products
- ✅ Real-time data refresh capability

### Production-Ready Infrastructure
- ✅ Docker multi-stage builds
- ✅ Health checks for all services
- ✅ Resource limits and logging
- ✅ Secret management via GitLab variables

---

**Ready to Deploy!** 🚀  
**Date:** January 6, 2026
