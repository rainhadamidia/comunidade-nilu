import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface SelfCareLog {
  id: string;
  date: string;
  activities: string[];
  points: number;
}

export interface UserTip {
  id: string;
  userId: string;
  userNickname: string;
  userAvatar: string;
  title: string;
  description: string;
  howItHelped: string;
  type: 'book' | 'movie' | 'music' | 'selfcare';
  likes: number;
  likedBy: string[];
  comments: { id: string; userId: string; nickname: string; content: string; timestamp: Date }[];
  savedBy: string[];
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  progress: number;
  completedChallenges: number[];
  completedAnnualChallenges: number[];
  points: number;
  activeDays: string[];
  selfCareLogs: SelfCareLog[];
  lastCheckIn: string | null;
  isAdmin?: boolean;
}

interface PointAction {
  action: string;
  points: number;
  timestamp: Date;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, nickname: string, avatar: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateProgress: (challengeId: number) => void;
  completeAnnualChallenge: (challengeId: number) => void;
  addPoints: (amount: number, action: string) => void;
  doCheckIn: () => boolean;
  logSelfCare: (activities: string[]) => void;
  getAllUsers: () => User[];
  userTips: UserTip[];
  addUserTip: (tip: Omit<UserTip, 'id' | 'userId' | 'userNickname' | 'userAvatar' | 'likes' | 'likedBy' | 'comments' | 'savedBy' | 'createdAt'>) => void;
  likeUserTip: (tipId: string) => void;
  saveUserTip: (tipId: string) => void;
  commentOnTip: (tipId: string, content: string) => void;
  recentPointActions: PointAction[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AVATARS = ['🌟', '🧘', '🦋', '☀️', '🌙', '🔮', '🪷', '⚔️', '🌸', '🎯'];

// Points configuration
const POINTS = {
  CHECK_IN: 5,
  CHALLENGE_COMPLETE: 10,
  SELF_CARE_ITEM: 5,
  SHARE_TIP: 5,
  INTERACT: 5,
  WEEKLY_CHALLENGE: 30,
  MONTHLY_CHALLENGE: 100,
  ANNUAL_CHALLENGE: 50,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userTips, setUserTips] = useState<UserTip[]>([]);
  const [recentPointActions, setRecentPointActions] = useState<PointAction[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('iluminnados_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure new fields exist
      setUser({
        ...parsedUser,
        points: parsedUser.points || 0,
        activeDays: parsedUser.activeDays || [],
        selfCareLogs: parsedUser.selfCareLogs || [],
        completedAnnualChallenges: parsedUser.completedAnnualChallenges || [],
        lastCheckIn: parsedUser.lastCheckIn || null,
      });
    }
    
    const savedTips = localStorage.getItem('iluminnados_tips');
    if (savedTips) {
      setUserTips(JSON.parse(savedTips));
    }
    
    setIsLoading(false);
  }, []);

  const saveUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('iluminnados_user', JSON.stringify(updatedUser));
    
    // Update in users list too
    const savedUsers = JSON.parse(localStorage.getItem('iluminnados_users') || '[]');
    const updatedUsers = savedUsers.map((u: any) => 
      u.id === updatedUser.id ? { ...u, ...updatedUser } : u
    );
    localStorage.setItem('iluminnados_users', JSON.stringify(updatedUsers));
  };

  const addPointAction = (action: string, points: number) => {
    setRecentPointActions(prev => [
      { action, points, timestamp: new Date() },
      ...prev.slice(0, 9)
    ]);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const savedUsers = JSON.parse(localStorage.getItem('iluminnados_users') || '[]');
    const foundUser = savedUsers.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      const enhancedUser = {
        ...userWithoutPassword,
        points: userWithoutPassword.points || 0,
        activeDays: userWithoutPassword.activeDays || [],
        selfCareLogs: userWithoutPassword.selfCareLogs || [],
        completedAnnualChallenges: userWithoutPassword.completedAnnualChallenges || [],
        lastCheckIn: userWithoutPassword.lastCheckIn || null,
      };
      setUser(enhancedUser);
      localStorage.setItem('iluminnados_user', JSON.stringify(enhancedUser));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, nickname: string, avatar: string): Promise<boolean> => {
    const savedUsers = JSON.parse(localStorage.getItem('iluminnados_users') || '[]');
    
    if (savedUsers.some((u: any) => u.email === email)) {
      return false;
    }

    const isAdmin = email === 'admin@iluminnados.com';

    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      email,
      password,
      nickname,
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      progress: 0,
      completedChallenges: [],
      completedAnnualChallenges: [],
      points: 0,
      activeDays: [],
      selfCareLogs: [],
      lastCheckIn: null,
      isAdmin,
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
    setRecentPointActions([]);
    localStorage.removeItem('iluminnados_user');
  };

  const addPoints = (amount: number, action: string) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const updatedUser = {
      ...user,
      points: user.points + amount,
      activeDays: user.activeDays.includes(today) 
        ? user.activeDays 
        : [...user.activeDays, today],
    };
    
    saveUser(updatedUser);
    addPointAction(action, amount);
  };

  const doCheckIn = (): boolean => {
    if (!user) return false;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (user.lastCheckIn === today) {
      return false;
    }
    
    const updatedUser = {
      ...user,
      points: user.points + POINTS.CHECK_IN,
      lastCheckIn: today,
      activeDays: user.activeDays.includes(today)
        ? user.activeDays
        : [...user.activeDays, today],
    };
    
    saveUser(updatedUser);
    addPointAction('Check-in diário', POINTS.CHECK_IN);
    return true;
  };

  const updateProgress = (challengeId: number) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const updatedUser = {
      ...user,
      completedChallenges: [...user.completedChallenges, challengeId],
      progress: Math.min(100, ((user.completedChallenges.length + 1) / 8) * 100),
      points: user.points + POINTS.CHALLENGE_COMPLETE,
      activeDays: user.activeDays.includes(today)
        ? user.activeDays
        : [...user.activeDays, today],
    };
    
    saveUser(updatedUser);
    addPointAction('Desafio concluído', POINTS.CHALLENGE_COMPLETE);
  };

  const completeAnnualChallenge = (challengeId: number) => {
    if (!user) return;
    
    if (user.completedAnnualChallenges.includes(challengeId)) return;
    
    const today = new Date().toISOString().split('T')[0];
    const updatedUser = {
      ...user,
      completedAnnualChallenges: [...user.completedAnnualChallenges, challengeId],
      points: user.points + POINTS.ANNUAL_CHALLENGE,
      activeDays: user.activeDays.includes(today)
        ? user.activeDays
        : [...user.activeDays, today],
    };
    
    saveUser(updatedUser);
    addPointAction('Desafio anual concluído', POINTS.ANNUAL_CHALLENGE);
  };

  const logSelfCare = (activities: string[]) => {
    if (!user || activities.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const pointsEarned = activities.length * POINTS.SELF_CARE_ITEM;
    
    const newLog: SelfCareLog = {
      id: Date.now().toString(),
      date: today,
      activities,
      points: pointsEarned,
    };
    
    const existingLogIndex = user.selfCareLogs.findIndex(log => log.date === today);
    let updatedLogs = [...user.selfCareLogs];
    
    if (existingLogIndex >= 0) {
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        activities: [...new Set([...updatedLogs[existingLogIndex].activities, ...activities])],
        points: updatedLogs[existingLogIndex].points + pointsEarned,
      };
    } else {
      updatedLogs.push(newLog);
    }
    
    const updatedUser = {
      ...user,
      selfCareLogs: updatedLogs,
      points: user.points + pointsEarned,
      activeDays: user.activeDays.includes(today)
        ? user.activeDays
        : [...user.activeDays, today],
    };
    
    saveUser(updatedUser);
    addPointAction('Autocuidado registrado', pointsEarned);
  };

  const getAllUsers = (): User[] => {
    const savedUsers = JSON.parse(localStorage.getItem('iluminnados_users') || '[]');
    return savedUsers.map((u: any) => {
      const { password, ...userWithoutPassword } = u;
      return {
        ...userWithoutPassword,
        points: userWithoutPassword.points || 0,
        activeDays: userWithoutPassword.activeDays || [],
        selfCareLogs: userWithoutPassword.selfCareLogs || [],
        completedAnnualChallenges: userWithoutPassword.completedAnnualChallenges || [],
      };
    });
  };

  const saveTips = (tips: UserTip[]) => {
    setUserTips(tips);
    localStorage.setItem('iluminnados_tips', JSON.stringify(tips));
  };

  const addUserTip = (tip: Omit<UserTip, 'id' | 'userId' | 'userNickname' | 'userAvatar' | 'likes' | 'likedBy' | 'comments' | 'savedBy' | 'createdAt'>) => {
    if (!user) return;
    
    const newTip: UserTip = {
      ...tip,
      id: Date.now().toString(),
      userId: user.id,
      userNickname: user.nickname,
      userAvatar: user.avatar,
      likes: 0,
      likedBy: [],
      comments: [],
      savedBy: [],
      createdAt: new Date(),
    };
    
    const updatedTips = [newTip, ...userTips];
    saveTips(updatedTips);
    addPoints(POINTS.SHARE_TIP, 'Dica compartilhada');
  };

  const likeUserTip = (tipId: string) => {
    if (!user) return;
    
    const updatedTips = userTips.map(tip => {
      if (tip.id === tipId) {
        const hasLiked = tip.likedBy.includes(user.id);
        return {
          ...tip,
          likes: hasLiked ? tip.likes - 1 : tip.likes + 1,
          likedBy: hasLiked 
            ? tip.likedBy.filter(id => id !== user.id)
            : [...tip.likedBy, user.id],
        };
      }
      return tip;
    });
    
    saveTips(updatedTips);
    
    const tip = userTips.find(t => t.id === tipId);
    if (tip && !tip.likedBy.includes(user.id)) {
      addPoints(POINTS.INTERACT, 'Interação na comunidade');
    }
  };

  const saveUserTip = (tipId: string) => {
    if (!user) return;
    
    const updatedTips = userTips.map(tip => {
      if (tip.id === tipId) {
        const hasSaved = tip.savedBy.includes(user.id);
        return {
          ...tip,
          savedBy: hasSaved 
            ? tip.savedBy.filter(id => id !== user.id)
            : [...tip.savedBy, user.id],
        };
      }
      return tip;
    });
    
    saveTips(updatedTips);
  };

  const commentOnTip = (tipId: string, content: string) => {
    if (!user || !content.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      userId: user.id,
      nickname: user.nickname,
      content: content.trim(),
      timestamp: new Date(),
    };
    
    const updatedTips = userTips.map(tip => {
      if (tip.id === tipId) {
        return {
          ...tip,
          comments: [...tip.comments, newComment],
        };
      }
      return tip;
    });
    
    saveTips(updatedTips);
    addPoints(POINTS.INTERACT, 'Comentário adicionado');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      signup, 
      logout, 
      updateProgress,
      completeAnnualChallenge,
      addPoints,
      doCheckIn,
      logSelfCare,
      getAllUsers,
      userTips,
      addUserTip,
      likeUserTip,
      saveUserTip,
      commentOnTip,
      recentPointActions,
    }}>
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
