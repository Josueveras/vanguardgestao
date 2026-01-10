import React from 'react';
import {
  SquaresFour,
  Users,
  Briefcase,
  ChartLineUp,
  BookOpen,
  Gear,
  Rocket,
  Megaphone
} from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps & { isMobileOpen: boolean; setIsMobileOpen: (val: boolean) => void }> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const menuItems = [
    { path: '/', icon: SquaresFour, label: 'Hub Geral' },
    { path: '/projects', icon: Briefcase, label: 'Tarefas & Projetos' },
    { path: '/crm', icon: Rocket, label: 'CRM Comercial' },
    { path: '/performance', icon: ChartLineUp, label: 'Resultados & ROI' },
    { path: '/clients', icon: Users, label: 'Carteira de Clientes' },
    { path: '/media', icon: Megaphone, label: 'Conteúdo & Mídia' },
    { path: '/sop', icon: BookOpen, label: 'SOP & Playbooks' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-vblack text-gray-300 z-50 
          transition-all duration-300 shadow-xl border-r border-gray-800
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Desktop Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-10 bg-vred text-white rounded-full p-1 shadow-lg border-2 border-vblack hover:scale-110 transition-transform z-30"
        >
          {isCollapsed ? <CaretRight size={14} weight="bold" /> : <CaretLeft size={14} weight="bold" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <CaretLeft size={24} weight="bold" />
        </button>

        <div className={`p-6 ${isCollapsed ? 'items-center px-4' : ''}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-vred rounded-lg flex items-center justify-center text-white font-bold shrink-0">V</div>
            {!isCollapsed && <span className="font-bold text-white text-lg tracking-tight">Vanguarda</span>}
          </div>
          {!isCollapsed && <p className="text-[10px] text-gray-500 uppercase tracking-widest pl-11">Unidade de Crescimento</p>}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {!isCollapsed && <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operação</div>}
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)} // Close on mobile navigation
              title={isCollapsed ? item.label : ''}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isCollapsed ? 'justify-center' : ''}
                ${isActive ? 'bg-gray-800 text-white font-medium' : 'hover:bg-gray-900 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} weight={isActive ? 'fill' : 'regular'} />
                  {!isCollapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <NavLink
            to="/settings"
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? 'Configurações' : ''}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${isCollapsed ? 'justify-center' : ''}
              ${isActive ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <Gear size={20} weight={isActive ? 'fill' : 'regular'} />
                {!isCollapsed && <span>Configurações</span>}
              </>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
};
