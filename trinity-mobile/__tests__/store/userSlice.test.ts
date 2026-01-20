import userReducer, { setUser, userSlice } from '../../src/store/userSlice';

describe('userSlice', () => {
  const initialState = {
    user: null,
  };

  const sampleUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '0123456789',
    billing: {
      address: '123 Main St',
      zipCode: '75001',
      city: 'Paris',
      country: 'France',
    },
    isAdmin: false,
  };

  it('should return initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should set user data', () => {
    const state = userReducer(initialState, setUser(sampleUser));
    
    expect(state.user).toEqual(sampleUser);
  });

  it('should update user when already set', () => {
    const stateWithUser = {
      user: sampleUser,
    };

    const updatedUser = {
      ...sampleUser,
      firstName: 'Jane',
    };

    const state = userReducer(stateWithUser, setUser(updatedUser));
    
    expect(state.user?.firstName).toBe('Jane');
  });

  it('should logout user', () => {
    const stateWithUser = {
      user: sampleUser,
    };

    const state = userReducer(stateWithUser, userSlice.actions.clearUser());
    
    expect(state.user).toBeNull();
  });

  it('should handle partial user data', () => {
    const partialUser = {
      id: '456',
      email: 'partial@example.com',
      firstName: 'Test',
    };

    const state = userReducer(initialState, setUser(partialUser as any));
    
    expect(state.user?.id).toBe('456');
    expect(state.user?.email).toBe('partial@example.com');
    expect(state.user?.firstName).toBe('Test');
  });

  it('should set admin user', () => {
    const adminUser = {
      ...sampleUser,
      isAdmin: true,
    };

    const state = userReducer(initialState, setUser(adminUser));
    
    expect(state.user?.isAdmin).toBe(true);
  });

  it('should handle logout from initial state', () => {
    const state = userReducer(initialState, userSlice.actions.clearUser());
    
    expect(state.user).toBeNull();
  });
});
