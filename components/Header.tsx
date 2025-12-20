
import React from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentView: 'calendario' | 'diario' | 'configuracoes' | 'chat';
  onViewChange: (view: 'calendario' | 'diario' | 'configuracoes' | 'chat') => void;
  userAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, theme, toggleTheme, currentView, onViewChange, userAvatar }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-b-surface-border bg-white dark:bg-background-dark px-4 py-3 lg:px-10 transition-colors duration-300">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="size-8 flex items-center justify-center shrink-0 bg-white rounded-full">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight hidden sm:block">Diário de Oração</h2>
        </div>
        <nav className="hidden md:flex items-center gap-9">
          <button
            onClick={() => onViewChange('calendario')}
            className={`${currentView === 'calendario' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-text-secondary hover:text-primary'} text-sm font-bold leading-normal pb-0.5 transition-all`}
          >
            Calendário
          </button>
          <button
            onClick={() => onViewChange('diario')}
            className={`${currentView === 'diario' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-text-secondary hover:text-primary'} text-sm font-bold leading-normal pb-0.5 transition-all`}
          >
            Diário
          </button>
          <button
            onClick={() => onViewChange('chat')}
            className={`${currentView === 'chat' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-text-secondary hover:text-primary'} text-sm font-bold leading-normal pb-0.5 transition-all`}
          >
            Mentor IA
          </button>
          <button
            onClick={() => onViewChange('configuracoes')}
            className={`${currentView === 'configuracoes' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 dark:text-text-secondary hover:text-primary'} text-sm font-bold leading-normal pb-0.5 transition-all`}
          >
            Configurações
          </button>
        </nav>
      </div>

      <div className="flex flex-1 justify-end gap-3 items-center">
        {/* Pesquisa só aparece na visualização de Diário */}
        {currentView === 'diario' && (
          <label className="flex flex-col min-w-[140px] !h-10 max-w-64 transition-all animate-in fade-in slide-in-from-right-2">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full group">
              <div className="text-slate-400 dark:text-text-secondary flex border-none bg-slate-100 dark:bg-surface-border items-center justify-center pl-3 rounded-l-lg border-r-0 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-slate-100 dark:bg-surface-border h-full placeholder:text-slate-400 dark:placeholder:text-text-secondary px-3 rounded-l-none border-l-0 pl-1 text-sm font-normal"
                placeholder="Filtrar orações..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </label>
        )}

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-surface-border text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center shrink-0"
        >
          <span className="material-symbols-outlined text-xl">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button
          onClick={() => onViewChange('configuracoes')}
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer shrink-0"
          style={{ backgroundImage: `url("${userAvatar || 'https://picsum.photos/seed/spirit-user/100'}")` }}
        ></button>
      </div>
    </header>
  );
};

export default Header;
