import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  progress: number;
  completedChallenges: number[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, nickname: string, avatar: string) => Promise<boolean>;
  logout: () => void;
  updateProgress: (challengeId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AVATARS = ['🌟', '🧘', '🦋', '☀️', '🌙', '🔮', '🪷', '⚔️', '🌸', '🎯'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('iluminnados_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would be an API call
    const savedUsers = JSON.parse(localStorage.getItem('iluminnados_users') || '[]');
    const foundUser = savedUsers.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('iluminnados_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, nickname: string, avatar: string): Promise<boolean> => {
    const savedUsers = JSON.parse(localStorage.getItem('iluminnados_users') || '[]');
    
    if (savedUsers.some((u: any) => u.email === email)) {
      return false;
    }

    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      email,
      password,
      nickname,
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      progress: 0,
      completedChallenges: [],
    };

    savedUsers.push(newUser);
    localStorage.setItem('iluminnados_users', JSON.stringify(savedUsers));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('iluminnados_user', JSON.stringify(userWithoutPassword));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('iluminnados_user');
  };

  const updateProgress = (challengeId: number) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      completedChallenges: [...user.completedChallenges, challengeId],
      progress: Math.min(100, ((user.completedChallenges.length + 1) / 8) * 100),
    };
    
    setUser(updatedUser);
    localStorage.setItem('iluminnados_user', JSON.stringify(updatedUser));
    
    // Update in users list too
    const savedUsers = JSON.parse(localStorage.getItem('iluminnados_users') || '[]');
    const updatedUsers = savedUsers.map((u: any) => 
      u.id === user.id ? { ...u, ...updatedUser } : u
    );
    localStorage.setItem('iluminnados_users', JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProgress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
