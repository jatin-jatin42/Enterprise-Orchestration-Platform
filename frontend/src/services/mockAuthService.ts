import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types';

// Mock user database
const mockUsers: User[] = [
  {
    _id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      department: 'IT'
    },
    isActive: true,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      department: 'Engineering'
    },
    isActive: true,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(1000); // Simulate API call
    
    const user = mockUsers.find(u => 
      u.email === credentials.email && 
      credentials.password === 'password123' // Simple password check for demo
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    return {
      user,
      token: 'mock-jwt-token-' + user._id,
      refreshToken: 'mock-refresh-token-' + user._id
    };
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    await delay(1000); // Simulate API call

    // Check if user already exists
    const existingUser = mockUsers.find(u => 
      u.email === userData.email || u.username === userData.username
    );

    if (existingUser) {
      throw new Error('User already exists with this email or username');
    }

    // Create new user
    const newUser: User = {
      _id: (mockUsers.length + 1).toString(),
      username: userData.username,
      email: userData.email,
      role: userData.role || 'user',
      profile: userData.profile || {},
      isActive: true,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    return {
      user: newUser,
      token: 'mock-jwt-token-' + newUser._id,
      refreshToken: 'mock-refresh-token-' + newUser._id
    };
  },

  getProfile: async (): Promise<User> => {
    await delay(500); // Simulate API call
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    // Extract user ID from mock token
    const userId = token.replace('mock-jwt-token-', '');
    const user = mockUsers.find(u => u._id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
};