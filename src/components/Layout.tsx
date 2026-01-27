import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Users, 
  Heart, 
  BookOpen, 
  Brain, 
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Map, label: 'Mapa de Desafios', path: '/challenges' },
  { icon: Users, label: 'Praça dos Iluminnados', path: '/community' },
  { icon: Heart, label: 'Espaço Seguro', path: '/safe-space' },
  { icon: BookOpen, label: 'Conteúdos', path: '/contents' },
  { icon: Brain, label: 'Personalidades', path: '/personalities' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <h1 className="text-xl font-bold neon-text">Iluminnados</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'nav-item',
                  location.pathname === item.path && 'nav-item-active'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => {
                logout();
                navigate('/auth');
              }}
              className="nav-item text-destructive hover:text-destructive mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-card/50 backdrop-blur-sm border-r border-border p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <span className="text-3xl animate-float">✨</span>
          <h1 className="text-2xl font-bold neon-text">Iluminnados</h1>
        </div>

        {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-6">
            <div className="text-3xl">{user.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.nickname}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                'nav-item',
                location.pathname === item.path && 'nav-item-active'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          className="nav-item text-destructive hover:text-destructive mt-4"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>

        <div className="mt-4 p-4 rounded-lg bg-muted/20 text-center">
          <p className="text-xs text-muted-foreground italic">
            "Aqui ninguém é forçado a participar.<br />
            Mas quem participa, evolui."
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
