import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    // Aqui você pode adicionar lógica de logout (limpar tokens, etc)
    navigate('/');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={`bg-[#080D0D] text-[#F4F4F4] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } h-screen flex flex-col overflow-hidden`}
      >
        <div className="p-5 flex items-center justify-between border-b border-[#1A2020]">
          {!isCollapsed && <h2 className="text-lg font-semibold">Agendify</h2>}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-[#1A2020] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {menuCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-7">
              {!isCollapsed && (
                <h3 className="text-[#00A676] text-xs font-semibold mb-2 px-3 mt-1">
                  {category.title}
                </h3>
              )}
              {isCollapsed && (
                <div className="h-px bg-[#1A2020] mb-2 mt-1" />
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
                                ? 'bg-[#00A676] text-white' 
                                : 'hover:bg-[#1A2020] text-[#F4F4F4]'
                            }`}
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="right" 
                          sideOffset={4}
                          className="bg-[#080D0D] text-[#F4F4F4] border border-[#1A2020]"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          location.pathname === item.path
                            ? 'bg-[#00A676] text-white' 
                            : 'hover:bg-[#1A2020] text-[#F4F4F4]'
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

        <div className="border-t border-[#1A2020]">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className={`flex items-center gap-2 p-3 transition-colors justify-center relative group ${
                    location.pathname === '/settings'
                      ? 'bg-[#00A676] text-white'
                      : 'hover:bg-[#1A2020] text-[#F4F4F4]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#00A676] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">AD</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowLogoutDialog(true);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E63946] hover:bg-[#D32F3C] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <LogOut className="w-3 h-3 text-white" />
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                sideOffset={4}
                className="bg-[#080D0D] text-[#F4F4F4] border border-[#1A2020]"
              >
                Configurações
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              to="/settings"
              className={`flex items-center gap-2 p-3 transition-colors relative group ${
                location.pathname === '/settings'
                  ? 'bg-[#00A676] text-white'
                  : 'hover:bg-[#1A2020] text-[#F4F4F4]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#00A676] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">AD</span>
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
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 opacity-60 hover:opacity-100 hover:bg-[#E63946] hover:text-white transition-colors"
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
            <AlertDialogTitle className="text-[#080D0D]">Confirmar Logout</AlertDialogTitle>
            <AlertDialogDescription className="text-[#6B6B6B]">
              Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E5E5E5] text-[#080D0D] hover:bg-[#F4F4F4]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-[#E63946] hover:bg-[#D32F3C] text-white"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}