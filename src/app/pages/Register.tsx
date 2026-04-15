import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import logoClara from '../../assets/logo-clara.png';
import logoEscura from '../../assets/logo-escura.png';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Criar conta
      await api.post('/auth/register', { name, email, password });
      
      toast.success('Conta criada com sucesso!', {
        description: 'Fazendo seu login instantaneamente...'
      });
      
      // 2. Fazer login automático em seguida
      const response = await api.post('/auth/login', { email, password });
      login(response.token, response.user);
      navigate('/dashboard');

    } catch (error: any) {
      toast.error('Ocorreu um erro.', {
        description: error.message || 'Verifique seus dados e tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="backdrop-blur-xl bg-card/40 border border-border/50 shadow-2xl shadow-black/40 rounded-3xl p-8">
          
          {/* Header */}
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <div className="mb-6">
              <img src={logoClara} alt="GiroMob" className="h-16 w-auto dark:hidden" />
              <img src={logoEscura} alt="GiroMob" className="h-16 w-auto hidden dark:block" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">Comece a usar</h1>
            <p className="text-muted-foreground text-sm">Crie sua conta para gerenciar seu financeiro.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 group">
              <label className="text-sm font-medium text-foreground/80 group-focus-within:text-blue-400 transition-colors">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome" 
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-medium text-foreground/80 group-focus-within:text-blue-400 transition-colors">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-medium text-foreground/80 group-focus-within:text-emerald-400 transition-colors">Senha segura</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-10 h-12 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all rounded-xl"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 mt-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white rounded-xl font-medium tracking-wide shadow-lg shadow-blue-500/25 transition-all group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2 relative z-10">
                  Criar minha conta
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center border-t border-border/30 pt-6">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
