import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnlineUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  online_at: string;
}

interface PresenceContextValue {
  onlineUsers: OnlineUser[];
  onlineCount: number;
}

const PresenceContext = createContext<PresenceContextValue>({
  onlineUsers: [],
  onlineCount: 0,
});

const PRESENCE_CHANNEL = 'iluminnados-presence';

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const userId = user?.id;
  const nickname = user?.nickname;
  const avatar = user?.avatar;
  const email = user?.email;

  useEffect(() => {
    if (!userId) {
      setOnlineUsers([]);
      return;
    }

    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<OnlineUser>();
        // Deduplicate by user_id (a user may have multiple tabs)
        const map = new Map<string, OnlineUser>();
        Object.values(state).forEach((presences) => {
          presences.forEach((p) => {
            if (!map.has(p.user_id)) map.set(p.user_id, p);
          });
        });
        setOnlineUsers(Array.from(map.values()));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            display_name: nickname || email?.split('@')[0] || 'Iluminnado',
            avatar_url: avatar || null,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Heartbeat: re-track every 30s to keep presence fresh
    const heartbeat = setInterval(() => {
      channel.track({
        user_id: userId,
        display_name: nickname || email?.split('@')[0] || 'Iluminnado',
        avatar_url: avatar || null,
        online_at: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, [userId, nickname, avatar, email]);

  return (
    <PresenceContext.Provider value={{ onlineUsers, onlineCount: onlineUsers.length }}>
      {children}
    </PresenceContext.Provider>
  );
}

export const usePresence = () => useContext(PresenceContext);
