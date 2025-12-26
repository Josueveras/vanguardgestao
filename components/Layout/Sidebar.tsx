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

export const Sidebar: React.FC = () => {
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
    <aside className="w-64 bg-vblack text-gray-300 flex flex-col fixed h-full z-20 transition-all duration-300 shadow-xl">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-vred rounded-lg flex items-center justify-center text-white font-bold">V</div>
          <span className="font-bold text-white text-lg tracking-tight">Vanguarda</span>
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest pl-11">Unidade de Crescimento</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operação</div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${isActive ? 'bg-gray-800 text-white font-medium' : 'hover:bg-gray-900 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} weight={isActive ? 'fill' : 'regular'} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <NavLink
          to="/settings"
          className={({ isActive }) => `
            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
            ${isActive ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white'}
          `}
        >
          {({ isActive }) => (
            <>
              <Gear size={18} weight={isActive ? 'fill' : 'regular'} /> Configurações
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
