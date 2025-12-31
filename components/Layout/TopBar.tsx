import React, { useState } from 'react';
import { MagnifyingGlass, Bell, SignOut, CaretDown } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';

export const TopBar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const userInitials = (user?.user_metadata?.full_name || user?.email || 'AD').substring(0, 2).toUpperCase();

  return (
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-500 bg-white/80 border-b border-gray-100 backdrop-blur-md">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full group">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vred" size={16} />
          <input
            type="text"
            placeholder="Buscar (Cmd + K)"
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none transition-all bg-gray-50 border-transparent text-vblack focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <div className="px-1.5 py-0.5 rounded border text-[10px] font-medium bg-white border-gray-200 text-gray-400">⌘</div>
            <div className="px-1.5 py-0.5 rounded border text-[10px] font-medium bg-white border-gray-200 text-gray-400">K</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative transition-colors text-gray-400 hover:text-vblack">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-vred rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 shadow-sm bg-gradient-to-br from-gray-800 to-black text-white border-white">
              {userInitials}
            </div>
            <CaretDown size={12} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Conectado como</p>
                  <p className="text-sm font-semibold text-vblack truncate">
                    {user?.user_metadata?.full_name || user?.email || 'Usuário'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <SignOut size={16} />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
