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
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!user) {
      setOnlineUsers([]);
      return;
    }

    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: user.id } },
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
            user_id: user.id,
            display_name: profile?.nickname || user.email?.split('@')[0] || 'Iluminnado',
            avatar_url: profile?.avatar || null,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile?.nickname, profile?.avatar]);

  return (
    <PresenceContext.Provider value={{ onlineUsers, onlineCount: onlineUsers.length }}>
      {children}
    </PresenceContext.Provider>
  );
}

export const usePresence = () => useContext(PresenceContext);
