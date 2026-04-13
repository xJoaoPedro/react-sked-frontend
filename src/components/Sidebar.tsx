import { useState } from 'react';
import { socket } from "@/services/socket";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import skedLogo from '../assets/skedLogo.svg';
import { Users, BarChart3, Menu, LayoutDashboard, CalendarCheck, CalendarX, DollarSign, Package, Wrench, UserCog, CalendarDays, Percent, LogOut, LucideIcon, } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider, } from './ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from './ui/alert-dialog';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

const menuCategories: MenuCategory[] = [
  {
    title: 'Geral',
    items: [
      { icon: LayoutDashboard, label: 'Painel', path: '/dashboard' },
    ],
  },
  {
    title: 'Agenda',
    items: [
      { icon: CalendarDays, label: 'Agenda do Dia', path: '/daily-schedule' },
      { icon: CalendarCheck, label: 'Agendamentos', path: '/appointments' },
      { icon: CalendarX, label: 'Cancelamentos', path: '/cancellations' },
    ],
  },
  {
    title: 'Caixa',
    items: [
      { icon: DollarSign, label: 'Receitas', path: '/revenue' },
      { icon: Percent, label: 'Comissões', path: '/commissions' },
      { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    ],
  },
  {
    title: 'Meu Negócio',
    items: [
      { icon: Package, label: 'Estoque', path: '/inventory' },
      { icon: Wrench, label: 'Serviços', path: '/services' },
      { icon: UserCog, label: 'Profissionais', path: '/professionals' },
      { icon: Users, label: 'Clientes', path: '/customers' },
    ],
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("companyId");
    socket.disconnect();
    navigate("/login");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={`bg-foreground text-secondary transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } h-screen flex flex-col overflow-hidden`}
      >
        <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
          {!isCollapsed && <h2 className="text-lg font-semibold"><img src={skedLogo} alt="Dollar Sign" className="h-8" /></h2>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-7">
              {!isCollapsed && (
                <h3 className="text-primary text-xs font-semibold mb-2 px-3 mt-1">
                  {category.title}
                </h3>
              )}
              {isCollapsed && (
                <div className="h-px bg-sidebar-accent mb-2 mt-1" />
              )}
              <ul className="space-y-1">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              location.pathname === item.path
                                ? 'bg-primary text-popover' 
                                : 'hover:bg-sidebar-accent text-secondary'
                            }`}
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          sideOffset={4}
                          className="bg-foreground text-secondary border border-sidebar-accent"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          location.pathname === item.path
                            ? 'bg-primary text-popover' 
                            : 'hover:bg-sidebar-accent text-secondary'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-accent">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className={`flex items-center gap-2 p-3 transition-colors justify-center relative group ${
                    location.pathname === '/settings'
                      ? 'bg-primary text-popover'
                      : 'hover:bg-sidebar-accent text-secondary'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-popover text-sm font-medium">AD</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowLogoutDialog(true);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <LogOut className="w-3 h-3 text-popover" />
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                sideOffset={4}
                className="bg-foreground text-secondary border border-sidebar-accent"
              >
                Configurações
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              to="/settings"
              className={`flex items-center gap-2 p-3 transition-colors relative group ${
                location.pathname === '/settings'
                  ? 'bg-primary text-popover'
                  : 'hover:bg-sidebar-accent text-secondary'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-popover text-sm font-medium">AD</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-[#6B6B6B] truncate">admin@agendify.com</p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowLogoutDialog(true);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-destructive hover:text-popover transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </Link>
          )}
        </div>
      </aside>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-white border-[#E5E5E5]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-bold">Tem certeza que deseja sair?</AlertDialogTitle>
            <AlertDialogDescription className="text-destructive">
              Você precisará fazer login novamente para acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="p-4 border border-border bg-default text-foreground hover:bg-primary hover:text-popover">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-destructive hover:bg-destructive/70 text-popover"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}