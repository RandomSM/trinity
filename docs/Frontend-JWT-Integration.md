# Frontend JWT Integration Guide

## Overview

This document describes the complete JWT token integration in the frontend application. The implementation provides automatic token management, request authentication, and error handling.

## Architecture

### API Client (`trinity/src/lib/api.ts`)

The centralized API client uses Axios with interceptors to handle JWT tokens automatically.

#### Key Features

1. **Automatic Token Injection**
   - Request interceptor adds `Authorization: Bearer ${token}` to all requests
   - Token is retrieved from localStorage
   - No manual token management needed in components

2. **Automatic Error Handling**
   - Response interceptor catches 401 (Unauthorized) and 403 (Forbidden)
   - Automatically clears localStorage and redirects to `/login?expired=true`
   - Session expiration is handled transparently

3. **API Modules**
   - `authAPI`: Login, register, logout, getCurrentUser, isAuthenticated, isAdmin
   - `usersAPI`: User CRUD operations (getAll, getById, update, delete, adminEdit, adminDelete)
   - `productsAPI`: Product CRUD operations
   - `invoicesAPI`: Invoice CRUD operations
   - `paypalAPI`: PayPal order creation and capture
   - `reportsAPI`: KPI reports and trending products

## Updated Components

### 1. Login Page (`trinity/src/app/login/page.tsx`)

**Changes:**
- Replaced `fetch()` with `authAPI.login(email, password)`
- Added error state with DaisyUI alert UI
- Added loading state with spinner
- Added session expiration detection via `searchParams.get('expired')`
- Admin users redirected to `/admin`, regular users to `/`

**Flow:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const data = await authAPI.login(email, password);
    // Token stored automatically in localStorage by API client
    dispatch(setUser({ email: data.email, id: data.id, ... }));
    router.push(data.isAdmin ? "/admin" : "/");
  } catch (error: any) {
    setError(error.response?.data?.error || "Identifiants incorrects");
  } finally {
    setLoading(false);
  }
};
```

### 2. Register Page (`trinity/src/app/register/page.tsx`)

**Changes:**
- Replaced `fetch()` with `authAPI.register({ email, password, firstName, lastName, phone })`
- Added error state with alert UI
- Added loading state with spinner
- Redirects to `/login?registered=true` on success
- Disabled form inputs during submission

**Flow:**
```typescript
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await authAPI.register({ email, password, firstName, lastName, phone });
    router.push("/login?registered=true");
  } catch (error: any) {
    setError(error.response?.data?.error || "Erreur lors de l'inscription");
  } finally {
    setLoading(false);
  }
};
```

### 3. Navbar Component (`trinity/src/components/Navbar.tsx`)

**Changes:**
- Replaced manual logout logic with `authAPI.logout()`
- Added `clearCart()` dispatch to clear cart on logout
- Imported `authAPI` from `@/lib/api`

**Flow:**
```typescript
const handleLogout = () => {
  dispatch(logout());
  dispatch(clearCart());
  authAPI.logout(); // Clears localStorage and redirects to /
};
```

### 4. Profile Page (`trinity/src/app/profile/page.tsx`)

**Changes:**
- Replaced JWT parsing logic with `authAPI.getCurrentUser()`
- Replaced `fetch()` with `usersAPI.update(userId, formData)`
- Added error and success state management
- Added loading states for save button
- Disabled form during submission

**Flow:**
```typescript
// Load user data
useEffect(() => {
  const loadUserData = async () => {
    if (!user && authAPI.isAuthenticated()) {
      try {
        const userData = await authAPI.getCurrentUser();
        dispatch(setUser({ ... }));
      } catch (error) {
        router.push("/login");
      }
    }
  };
  loadUserData();
}, [user]);

// Update profile
const handleSave = async () => {
  setLoading(true);
  try {
    const updatedUser = await usersAPI.update(user.id, formData);
    dispatch(setUser({ ... }));
    setSuccess("Profil mis à jour avec succès !");
  } catch (err: any) {
    setError(err.response?.data?.error || "Impossible de mettre à jour");
  } finally {
    setLoading(false);
  }
};
```

### 5. Admin Page (`trinity/src/app/admin/page.tsx`)

**Changes:**
- Replaced JWT parsing logic with `authAPI.getCurrentUser()`
- Replaced `fetch()` with `usersAPI.getAll()`
- Added error state management
- Added admin role verification

**Flow:**
```typescript
// Check authentication
useEffect(() => {
  const checkAuth = async () => {
    if (!user && authAPI.isAuthenticated()) {
      try {
        const userData = await authAPI.getCurrentUser();
        dispatch(setUser({ ... }));
        if (!userData.isAdmin) {
          router.push("/");
          return;
        }
      } catch (err) {
        router.push("/login");
      }
    }
  };
  checkAuth();
}, [user]);

// Fetch users
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const usersData = await usersAPI.getAll();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors du chargement");
    }
  };
  fetchUsers();
}, [checkingAuth, user]);
```

### 6. User Table Component (`trinity/src/app/admin/UserTable.tsx`)

**Changes:**
- Replaced `fetch()` with `usersAPI.adminEdit()` and `usersAPI.adminDelete()`
- Added loading and error states
- Added confirmation dialog for delete
- Disabled buttons during operations

**Flow:**
```typescript
const handleSave = async () => {
  setLoading(true);
  try {
    await usersAPI.adminEdit(editingUser._id, formData);
    setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...formData } : u));
    setEditingUser(null);
  } catch (err: any) {
    setError(err.response?.data?.error || "Erreur lors de la mise à jour");
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (id: string) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
  
  setLoading(true);
  try {
    await usersAPI.adminDelete(id);
    setUsers(users.filter(u => u._id !== id));
  } catch (err: any) {
    setError(err.response?.data?.error || "Erreur lors de la suppression");
  } finally {
    setLoading(false);
  }
};
```

## Authentication Flow

### Login Flow
```
1. User enters credentials → handleLogin()
2. authAPI.login(email, password)
3. Backend validates credentials
4. Backend returns { token, user }
5. API client stores token in localStorage
6. Redux store updated with user data
7. Redirect to /admin (if admin) or / (if regular user)
```

### Authenticated Request Flow
```
1. Component calls API (e.g., usersAPI.getAll())
2. Request interceptor adds Authorization header
3. Backend validates JWT token via middleware
4. Backend returns data or error
5. Response interceptor handles 401/403 errors
6. Component receives data or catches error
```

### Logout Flow
```
1. User clicks logout → handleLogout()
2. authAPI.logout() called
3. localStorage.removeItem("token")
4. Redux store cleared (logout(), clearCart())
5. Router redirects to /
```

### Session Expiration Flow
```
1. User makes request with expired token
2. Backend returns 401 Unauthorized
3. Response interceptor catches error
4. localStorage cleared
5. User redirected to /login?expired=true
6. Login page shows "Session expirée" message
```

## Security Features

### 1. Token Storage
- Stored in localStorage (accessible only by same-origin scripts)
- Automatically removed on logout or 401/403 errors
- Never exposed in URLs or query parameters

### 2. Request Authentication
- All requests automatically include Bearer token
- Backend middleware validates token on protected routes
- Invalid/expired tokens rejected with 401

### 3. Authorization Levels
- **Public routes**: No token required (login, register)
- **Authenticated routes**: Valid token required (profile, invoices)
- **Owner-only routes**: Token with matching userId (edit own profile)
- **Admin routes**: Token with isAdmin=true (user management, KPIs)

### 4. Error Handling
- Network errors: Display error message to user
- 401 Unauthorized: Clear token, redirect to login
- 403 Forbidden: Clear token, redirect to login (insufficient permissions)
- 400 Bad Request: Display validation error to user

## Dependencies

### Installed Packages
```json
{
  "axios": "^1.7.9"
}
```

### Installation
```bash
cd trinity
npm install axios
```

## Environment Variables

Required in `trinity/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Testing

### Manual Testing Checklist

1. **Login**
   - [ ] Login with valid credentials → redirects to home/admin
   - [ ] Login with invalid credentials → shows error message
   - [ ] Login as admin → redirects to /admin
   - [ ] Login shows loading spinner during request

2. **Register**
   - [ ] Register with valid data → redirects to /login
   - [ ] Register with existing email → shows error message
   - [ ] Register shows loading spinner during request

3. **Protected Routes**
   - [ ] Access /profile without token → redirects to /login
   - [ ] Access /admin without token → redirects to /login
   - [ ] Access /admin as non-admin → redirects to /

4. **Profile Update**
   - [ ] Update profile data → shows success message
   - [ ] Update with invalid data → shows error message
   - [ ] Update shows loading spinner during request

5. **Admin Panel**
   - [ ] Load users list → displays all users
   - [ ] Edit user → updates successfully
   - [ ] Delete user → removes from list
   - [ ] Shows error for failed operations

6. **Logout**
   - [ ] Logout clears token and redirects to /
   - [ ] Accessing protected route after logout → redirects to /login

7. **Token Expiration**
   - [ ] Expired token returns 401 → redirects to /login?expired=true
   - [ ] Login page shows "Session expirée" message

### Automated Testing

Add to `trinity/package.json`:
```json
{
  "scripts": {
    "test:jwt": "jest --testPathPattern=jwt"
  }
}
```

Example test file (`trinity/tests/jwt-integration.test.ts`):
```typescript
import { authAPI, usersAPI } from '@/lib/api';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JWT Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores token after login', async () => {
    const mockResponse = { data: { token: 'test-token', user: { email: 'test@test.com' } } };
    mockedAxios.post.mockResolvedValue(mockResponse);

    await authAPI.login('test@test.com', 'password');
    
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('includes token in authenticated requests', async () => {
    localStorage.setItem('token', 'test-token');
    
    await usersAPI.getAll();
    
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });

  it('redirects on 401 error', async () => {
    const mockError = { response: { status: 401 } };
    mockedAxios.get.mockRejectedValue(mockError);

    try {
      await usersAPI.getAll();
    } catch (err) {
      // Expected to throw after redirect
    }

    expect(localStorage.getItem('token')).toBeNull();
  });
});
```

## Troubleshooting

### Issue: "401 Unauthorized" on all requests
**Solution:**
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify JWT middleware is correctly configured in backend
- Check browser console for CORS errors

### Issue: Token not persisting after login
**Solution:**
- Check localStorage in browser DevTools (Application → Storage → Local Storage)
- Verify `authAPI.login()` is storing token correctly
- Check browser privacy settings (cookies/localStorage enabled)

### Issue: Redirect loop between /login and /profile
**Solution:**
- Verify token is valid (not expired or malformed)
- Check backend JWT validation middleware
- Clear localStorage and login again

### Issue: Admin routes accessible by non-admin users
**Solution:**
- Verify backend `requireAdmin` middleware is applied to admin routes
- Check `isAdmin` flag in Redux store
- Verify token contains correct `isAdmin` claim

## Future Improvements

1. **Token Refresh**
   - Implement refresh tokens for longer sessions
   - Auto-refresh before expiration

2. **Protected Route HOC**
   - Create `<ProtectedRoute>` component
   - Create `<AdminRoute>` component
   - Centralize authentication checks

3. **Token Storage**
   - Consider httpOnly cookies for enhanced security
   - Implement secure token storage service

4. **Error Handling**
   - Implement global error boundary
   - Add toast notifications for errors

5. **Testing**
   - Add comprehensive Jest tests
   - Add E2E tests with Playwright/Cypress

## Summary

The JWT integration is complete for the following pages:
- ✅ Login page
- ✅ Register page
- ✅ Profile page
- ✅ Admin page
- ✅ User table component
- ✅ Navbar component

**Remaining tasks:**
- Update admin dashboard page (KPIs)
- Update products pages
- Update cart/checkout pages
- Create protected route components
- Add comprehensive testing
