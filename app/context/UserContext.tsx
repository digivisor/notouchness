'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (data: any) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Demo kullanıcı
const DEMO_USER = {
  id: '1',
  email: 'demo@notouchness.com',
  password: 'demo123',
  firstName: 'Demo',
  lastName: 'User',
  phone: '0555 555 55 55',
  avatar: '',
  createdAt: new Date().toISOString(),
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // LocalStorage'dan kullanıcıyı yükle
  useEffect(() => {
    const savedUser = localStorage.getItem('notouchness_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoaded(true);
  }, []);

  // Kullanıcı değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        localStorage.setItem('notouchness_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('notouchness_user');
      }
    }
  }, [user, isLoaded]);

  const login = (email: string, password: string): boolean => {
    // Demo login kontrolü
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      const { password: _, ...userWithoutPassword } = DEMO_USER;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const register = (data: any): boolean => {
    // Yeni kullanıcı oluştur
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatar: '',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
