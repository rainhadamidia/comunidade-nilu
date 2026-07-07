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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userTips, setUserTips] = useState<UserTip[]>([]);
  const [recentPointActions, setRecentPointActions] = useState<PointAction[]>([]);

  useEffect(() => {
    // Set up auth listener FIRST, then check existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // Defer profile loading to avoid deadlocks
        setTimeout(() => loadUserProfile(newSession.user), 0);
      } else {
        setUser(null);
        localStorage.removeItem('iluminnados_user');
      }
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        loadUserProfile(existingSession.user);
      } else {
        setIsLoading(false);
      }
    });

    const savedTips = localStorage.getItem('iluminnados_tips');
    if (savedTips) {
      setUserTips(JSON.parse(savedTips));
    }

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supaUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supaUser.id)
        .maybeSingle();

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supaUser.id);

      const isAdmin = roles?.some(r => r.role === 'admin') ?? false;

      // Merge with localStorage gamification data (kept client-side for now)
      const localKey = `iluminnados_user_${supaUser.id}`;
      const savedLocal = localStorage.getItem(localKey);
      const localData = savedLocal ? JSON.parse(savedLocal) : {};

      const mergedUser: User = {
        id: supaUser.id,
        email: supaUser.email ?? profile?.email ?? '',
        nickname: profile?.display_name ?? supaUser.email?.split('@')[0] ?? 'Usuário',
        avatar: profile?.avatar_url ?? localData.avatar ?? AVATARS[0],
        progress: localData.progress ?? 0,
        completedChallenges: localData.completedChallenges ?? [],
        completedAnnualChallenges: localData.completedAnnualChallenges ?? [],
        points: profile?.points ?? 0,
        activeDays: localData.activeDays ?? [],
        selfCareLogs: localData.selfCareLogs ?? [],
        lastCheckIn: localData.lastCheckIn ?? null,
        isAdmin,
      };

      setUser(mergedUser);
    } catch (e) {
      console.error('Error loading profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Persist gamification data per-user locally
    localStorage.setItem(`iluminnados_user_${updatedUser.id}`, JSON.stringify(updatedUser));
    // Sync points to Supabase profile
    supabase
      .from('profiles')
      .update({ points: updatedUser.points })
      .eq('user_id', updatedUser.id)
      .then();
  };

  const addPointAction = (action: string, points: number) => {
    setRecentPointActions(prev => [
      { action, points, timestamp: new Date() },
      ...prev.slice(0, 9)
    ]);
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const signup = async (email: string, password: string, nickname: string, avatar: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const chosenAvatar = avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)];

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: nickname,
          avatar_url: chosenAvatar,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // If user created but no session => email confirmation required
    const needsConfirmation = !data.session;

    // Patch the auto-created profile with avatar and nickname
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ display_name: nickname, avatar_url: chosenAvatar })
        .eq('user_id', data.user.id);
    }

    return { success: true, needsConfirmation };
  };

  const logout = async () => {
    setRecentPointActions([]);
    await supabase.auth.signOut();
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
    const updatedLogs = [...user.selfCareLogs];
    
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
    return savedUsers.map((u: Record<string, unknown>) => {
      const { password, ...userWithoutPassword } = u;
      return {
        ...userWithoutPassword,
        points: userWithoutPassword.points || 0,
        activeDays: userWithoutPassword.activeDays || [],
        selfCareLogs: userWithoutPassword.selfCareLogs || [],
        completedAnnualChallenges: userWithoutPassword.completedAnnualChallenges || [],
      } as User;
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
      session,
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
