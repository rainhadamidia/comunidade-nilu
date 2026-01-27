import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { 
  Dumbbell, 
  Droplets, 
  Apple, 
  BookOpen, 
  Brain,
  Calendar,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';

const selfCareActivities = [
  { id: 'exercise', label: 'Atividade Física', icon: Dumbbell, color: 'text-orange-400' },
  { id: 'hydration', label: 'Hidratação', icon: Droplets, color: 'text-blue-400' },
  { id: 'nutrition', label: 'Alimentação Saudável', icon: Apple, color: 'text-green-400' },
  { id: 'reading', label: 'Leitura', icon: BookOpen, color: 'text-primary' },
  { id: 'meditation', label: 'Meditação', icon: Brain, color: 'text-accent' },
];

export default function SelfCare() {
  const { user, logSelfCare, doCheckIn } = useAuth();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const todayLog = user?.selfCareLogs?.find(log => log.date === today);
  const hasCheckedIn = user?.lastCheckIn === today;

  const handleCheckIn = () => {
    const success = doCheckIn();
    if (success) {
      toast({
        title: '✅ Check-in realizado!',
        description: '+5 pontos adicionados ao seu perfil.',
      });
    } else {
      toast({
        title: 'Check-in já feito',
        description: 'Você já fez seu check-in hoje.',
        variant: 'destructive',
      });
    }
  };

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleLogActivities = () => {
    if (selectedActivities.length === 0) {
      toast({
        title: 'Selecione atividades',
        description: 'Marque pelo menos uma atividade para registrar.',
        variant: 'destructive',
      });
      return;
    }

    logSelfCare(selectedActivities);
    toast({
      title: '🌟 Atividades registradas!',
      description: `+${selectedActivities.length * 5} pontos por cuidar de você!`,
    });
    setSelectedActivities([]);
  };

  // Calculate streak
  const calculateStreak = () => {
    if (!user?.activeDays || user.activeDays.length === 0) return 0;
    
    const sortedDays = [...user.activeDays].sort().reverse();
    let streak = 0;
    const now = new Date();
    
    for (let i = 0; i < sortedDays.length; i++) {
      const expectedDate = new Date(now);
      expectedDate.setDate(now.getDate() - i);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      
      if (sortedDays.includes(expectedStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayLog = user?.selfCareLogs?.find(log => log.date === dateStr);
    return {
      date: dateStr,
      dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      active: user?.activeDays?.includes(dateStr) || false,
      activities: dayLog?.activities || [],
    };
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Área de <span className="neon-text">Autocuidado</span>
          </h1>
          <p className="text-muted-foreground">
            Cuide de si mesmo diariamente e ganhe pontos por cada atividade.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{streak}</p>
            <p className="text-sm text-muted-foreground">Dias seguidos</p>
          </div>
          <div className="glass-card p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold text-accent">{user?.activeDays?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total de dias ativos</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold text-secondary">{user?.points || 0}</p>
            <p className="text-sm text-muted-foreground">Pontos totais</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <p className="text-2xl font-bold text-orange-400">{todayLog?.activities?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Atividades hoje</p>
          </div>
        </div>

        {/* Check-in Button */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Check-in Diário
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Faça seu check-in e ganhe +5 pontos!
              </p>
            </div>
            <Button
              onClick={handleCheckIn}
              disabled={hasCheckedIn}
              className={hasCheckedIn ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground neon-glow'}
            >
              {hasCheckedIn ? '✓ Feito hoje' : 'Fazer Check-in'}
            </Button>
          </div>
        </div>

        {/* Activity Tracker */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Registrar Atividades de Hoje
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Cada atividade registrada vale +5 pontos. Cuide de você!
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {selfCareActivities.map((activity) => {
              const isCompleted = todayLog?.activities?.includes(activity.id);
              const isSelected = selectedActivities.includes(activity.id);
              
              return (
                <div
                  key={activity.id}
                  onClick={() => !isCompleted && toggleActivity(activity.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                    isCompleted
                      ? 'bg-accent/10 border-accent/50 opacity-70 cursor-not-allowed'
                      : isSelected
                        ? 'bg-primary/20 border-primary/50'
                        : 'bg-muted/30 border-border hover:border-primary/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-accent/20' : 'bg-muted'}`}>
                    <activity.icon className={`w-6 h-6 ${isCompleted ? 'text-accent' : activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {isCompleted ? '✓ Registrado' : '+5 pontos'}
                    </p>
                  </div>
                  {!isCompleted && (
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleLogActivities}
            disabled={selectedActivities.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Registrar Atividades ({selectedActivities.length * 5} pontos)
          </Button>
        </div>

        {/* Weekly Overview */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Últimos 7 Dias</h2>
          
          <div className="flex justify-between gap-2">
            {last7Days.map((day) => (
              <div 
                key={day.date}
                className={`flex-1 text-center p-3 rounded-xl transition-all ${
                  day.active 
                    ? 'bg-accent/20 border border-accent/50' 
                    : 'bg-muted/30'
                }`}
              >
                <p className="text-xs text-muted-foreground uppercase">{day.dayName}</p>
                <div className={`w-8 h-8 mx-auto my-2 rounded-full flex items-center justify-center ${
                  day.active ? 'bg-accent text-accent-foreground' : 'bg-muted'
                }`}>
                  {day.active ? '✓' : '−'}
                </div>
                <p className="text-xs">
                  {day.activities.length > 0 ? `${day.activities.length} ativ.` : '−'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        {user?.selfCareLogs && user.selfCareLogs.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Histórico de Atividades</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[...user.selfCareLogs].reverse().slice(0, 10).map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(log.date).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.activities.length} atividades
                      </p>
                    </div>
                  </div>
                  <span className="text-accent font-bold">+{log.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
