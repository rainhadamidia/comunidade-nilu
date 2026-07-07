import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const AVATARS = ['🌟', '🧘', '🦋', '☀️', '🌙', '🔮', '🪷', '⚔️', '🌸', '🎯'];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          toast({
            title: 'Bem-vindo de volta!',
            description: 'Sua jornada continua.',
          });
          navigate('/');
        } else {
          const isUnconfirmed = result.error?.toLowerCase().includes('confirm');
          toast({
            title: isUnconfirmed ? 'E-mail não confirmado' : 'Erro ao entrar',
            description: isUnconfirmed
              ? 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
              : (result.error || 'E-mail ou senha incorretos.'),
            variant: 'destructive',
          });
        }
      } else {
        if (!nickname.trim()) {
          toast({
            title: 'Nickname obrigatório',
            description: 'Escolha um nome para sua jornada.',
            variant: 'destructive',
          });
          return;
        }
        const result = await signup(email, password, nickname, selectedAvatar);
        if (result.success) {
          if (result.needsConfirmation) {
            toast({
              title: 'Conta criada! ✉️',
              description: 'Enviamos um link de confirmação para seu e-mail. Confirme antes de entrar.',
            });
            setIsLogin(true);
          } else {
            toast({
              title: 'Conta criada!',
              description: 'Bem-vindo à sua jornada de iluminação.',
            });
            navigate('/');
          }
        } else {
          const jaCadastrado = result.error?.toLowerCase().includes('already registered')
            || result.error?.toLowerCase().includes('already exists')
            || result.error?.toLowerCase().includes('já está em uso');

          if (jaCadastrado) {
            toast({
              title: 'Você já tem uma conta! 👋',
              description: 'Esse e-mail já está cadastrado. Faça login com sua senha.',
            });
            setIsLogin(true);
          } else {
            toast({
              title: 'Erro ao criar conta',
              description: result.error || 'Tente novamente em instantes.',
              variant: 'destructive',
            });
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">✨</div>
          <h1 className="text-4xl font-bold neon-text mb-2">Iluminnados</h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Continue sua jornada de evolução' : 'Comece sua jornada de iluminação'}
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="nickname"
                      type="text"
                      placeholder="Seu nome na jornada"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Escolha seu avatar</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`text-3xl p-2 rounded-lg transition-all ${
                          selectedAvatar === avatar
                            ? 'bg-primary/20 neon-border scale-110'
                            : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 italic">
          "Aqui ninguém é forçado a participar.<br />
          Mas quem participa, evolui."
        </p>
      </div>
    </div>
  );
}
