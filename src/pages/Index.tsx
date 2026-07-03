import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Dashboard from './Dashboard';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checandoPci, setCheckandoPci] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    let ativo = true;
    setCheckandoPci(true);

    supabase
      .from('pci_results')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .then(({ data }) => {
        if (!ativo) return;
        if (!data || data.length === 0) {
          navigate('/diagnostico');
        } else {
          setCheckandoPci(false);
        }
      });

    return () => { ativo = false; };
  }, [user, navigate]);

  if (isLoading || (user && checandoPci)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">✨</div>
          <p className="text-muted-foreground">Carregando sua jornada...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Dashboard />;
};

export default Index;
