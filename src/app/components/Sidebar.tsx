import { Link, useLocation } from 'react-router';
import logoClara from '../../assets/logo-clara.png';
import logoEscura from '../../assets/logo-escura.png';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  CreditCard,
  Wallet,
  Tags,
  FileText,
  History,
  Activity,
  Menu,
  Users,
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
import { cn } from './ui/utils';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  userName?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Fluxo de Caixa', href: '/fluxo-caixa', icon: TrendingUp },
  { name: 'Contas a Receber', href: '/contas-receber', icon: DollarSign },
  { name: 'Contas a Pagar', href: '/contas-pagar', icon: CreditCard },
  { name: 'Contas Bancárias', href: '/contas-bancarias', icon: Wallet },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Categorias de Custo', href: '/categorias', icon: Tags },
  { name: 'DRE', href: '/dre', icon: FileText },
  { name: 'Histórico & Relatórios', href: '/historico', icon: History },
  { name: 'Score Financeiro', href: '/score', icon: Activity },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const displayUserName = user?.name || user?.email || 'Usuário';

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src={logoEscura} alt="GiroMob" className="h-8 dark:hidden" />
            <img src={logoClara} alt="GiroMob" className="h-8 hidden dark:block" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="text-sm text-sidebar-foreground/70">{displayUserName}</div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300',
          'lg:translate-x-0 backdrop-blur-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-center mb-4">
              <img src={logoEscura} alt="GiroMob" className="h-12 w-auto dark:hidden" />
              <img src={logoClara} alt="GiroMob" className="h-12 w-auto hidden dark:block" />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50 relative group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-semibold text-white">
                {displayUserName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {displayUserName}
                </p>
                <p className="text-xs text-sidebar-foreground/60">Administrador</p>
              </div>
              
              <div className="flex items-center gap-1">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ThemeToggle />
                </div>
                <button
                  onClick={logout}
                  className="hidden lg:flex opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive p-2 rounded-full transition-all text-sidebar-foreground/60 focus:opacity-100 outline-none"
                  title="Sair do sistema"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}