import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export function PointsToast() {
  const { recentPointActions } = useAuth();
  const [visibleAction, setVisibleAction] = useState<{ action: string; points: number } | null>(null);

  useEffect(() => {
    if (recentPointActions.length > 0) {
      const latestAction = recentPointActions[0];
      setVisibleAction(latestAction);
      
      const timer = setTimeout(() => {
        setVisibleAction(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [recentPointActions]);

  if (!visibleAction) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 animate-slide-up">
      <div className="glass-card p-4 border-accent/50 flex items-center gap-3">
        <div className="p-2 rounded-full bg-accent/20">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{visibleAction.action}</p>
          <p className="text-lg font-bold text-accent">+{visibleAction.points} pontos</p>
        </div>
      </div>
    </div>
  );
}
