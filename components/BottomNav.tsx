
import React from 'react';

interface BottomNavProps {
  currentView: 'calendario' | 'diario' | 'configuracoes' | 'chat';
  onViewChange: (view: 'calendario' | 'diario' | 'configuracoes' | 'chat') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const NavItem = ({ view, icon, label }: { view: typeof currentView, icon: string, label: string }) => (
    <button 
      onClick={() => onViewChange(view)}
      className={`flex flex-col items-center justify-center flex-1 py-2 transition-all ${
        currentView === view 
          ? 'text-primary' 
          : 'text-slate-400 dark:text-text-secondary'
      }`}
    >
      <span className={`material-symbols-outlined text-2xl ${currentView === view ? 'material-symbols-filled' : ''}`}>
        {icon}
      </span>
      <span className="text-[10px] font-bold mt-0.5">{label}</span>
    </button>
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-background-dark border-t border-slate-200 dark:border-surface-border flex justify-around items-center px-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <NavItem view="calendario" icon="calendar_month" label="Calendário" />
      <NavItem view="diario" icon="book_5" label="Diário" />
      <NavItem view="chat" icon="psychology" label="Mentor" />
      <NavItem view="configuracoes" icon="settings" label="Ajustes" />
    </nav>
  );
};

export default BottomNav;
