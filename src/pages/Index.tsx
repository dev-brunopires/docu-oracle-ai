import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, MessageSquare, BookOpen, Users, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Index() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
      
      // If authenticated, redirect to chat
      if (session) {
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-glow"></div>
          <p className="mt-4 text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8 relative z-10">
        <nav className="flex items-center justify-between glass border border-primary/20 rounded-2xl px-6 py-4 shadow-glow animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">Oráculo</h1>
              <p className="text-sm text-muted-foreground">Procedimentos IA</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            className="gradient-primary hover:opacity-90 transition-all shadow-glow"
          >
            Entrar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-up">
          <div className="inline-flex items-center justify-center w-24 h-24 gradient-primary rounded-3xl mb-6 shadow-glow">
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-6xl font-bold gradient-primary bg-clip-text text-transparent mb-6">
            Bem-vindo ao Oráculo
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Seu assistente inteligente para consultar procedimentos empresariais.
            Faça perguntas e receba respostas precisas baseadas na documentação oficial.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="gradient-primary hover:opacity-90 transition-all text-lg px-10 py-7 shadow-glow text-primary-foreground"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="glass border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-glow group animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl gradient-primary bg-clip-text text-transparent">Chat Inteligente</CardTitle>
              <CardDescription className="text-muted-foreground">
                Converse naturalmente com o assistente IA e obtenha respostas instantâneas sobre procedimentos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-glow group animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-accent" />
              </div>
              <CardTitle className="text-xl gradient-primary bg-clip-text text-transparent">Base de Conhecimento</CardTitle>
              <CardDescription className="text-muted-foreground">
                Acesso a todos os procedimentos da empresa organizados e sempre atualizados.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-glow group animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl gradient-primary bg-clip-text text-transparent">Gestão de Usuários</CardTitle>
              <CardDescription className="text-muted-foreground">
                Controle de acesso e permissões para administradores e usuários.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <Card className="max-w-2xl mx-auto gradient-primary border-0 shadow-glow">
            <CardContent className="p-12">
              <h3 className="text-4xl font-bold text-primary-foreground mb-4">Pronto para começar?</h3>
              <p className="text-primary-foreground/90 mb-8 text-lg">
                Crie sua conta gratuitamente e comece a usar o Oráculo agora mesmo.
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-background text-primary hover:bg-background/90 transition-all text-lg px-10 py-7"
              >
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-primary/20 relative z-10">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">© 2025 Oráculo. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
