import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo de volta.',
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: 'Cadastro realizado com sucesso!',
          description: 'Você já pode fazer login.',
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-dark p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md p-8 glass border-primary/20 shadow-glow relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-4 shadow-glow">
            <span className="text-3xl font-bold text-primary-foreground">O</span>
          </div>
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Oráculo
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="animate-fade-in">
              <Input
                type="text"
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary"
              />
            </div>
          )}

          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-primary hover:opacity-90 transition-all shadow-glow" 
            disabled={loading}
          >
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin
              ? 'Não tem uma conta? Cadastre-se'
              : 'Já tem uma conta? Entre'}
          </button>
        </div>

        {isLogin && (
          <div className="mt-6 p-4 glass rounded-lg border border-primary/20 animate-fade-in">
            <p className="text-sm text-muted-foreground text-center mb-2 font-medium">
              Credenciais de teste:
            </p>
            <p className="text-xs text-center text-foreground/80">
              <strong>Email:</strong> admin@oraculo.com<br />
              <strong>Senha:</strong> admin123
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
