
import React, { useMemo } from 'react';
import { Verse, Prayer, PrayerCategory } from '../types';
import PrayerCard from './PrayerCard';

interface SidebarProps {
  verse: Verse | null;
  prayers: Prayer[];
  allPrayers: Prayer[];
  onAddClick: () => void;
  onToggleFavorite: (id: string) => void;
  onEditPrayer: (prayer: Prayer) => void;
  onDeletePrayer: (id: string) => void;
  selectedDateLabel: string;
  viewMode: 'calendario' | 'diario' | 'configuracoes' | 'chat';
}

const Sidebar: React.FC<SidebarProps> = ({
  verse,
  prayers,
  allPrayers,
  onAddClick,
  onToggleFavorite,
  onEditPrayer,
  onDeletePrayer,
  selectedDateLabel,
  viewMode
}) => {
  if (viewMode === 'chat') return null;

  const streakStats = useMemo(() => {
    const uniqueDates = Array.from(new Set(
      allPrayers.map(p => new Date(p.date).toDateString())
    )).map(dateStr => new Date(dateStr)).sort((a, b) => b.getTime() - a.getTime());

    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastPrayerDate = uniqueDates[0];
    lastPrayerDate.setHours(0, 0, 0, 0);

    if (lastPrayerDate.getTime() !== today.getTime() && lastPrayerDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = uniqueDates[i - 1];
      const currentDate = uniqueDates[i];
      const diffTime = Math.abs(prevDate.getTime() - currentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) streak++;
      else break;
    }
    return streak;
  }, [allPrayers]);

  const stats = {
    total: allPrayers.length,
    favoritos: allPrayers.filter(p => p.isFavorite).length,
    esteMes: allPrayers.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).length,
    streak: streakStats
  };

  const renderContent = () => {
    if (viewMode === 'configuracoes') {
      return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right duration-500">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-surface-border shadow-sm text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-4">
              <span className="material-symbols-outlined text-4xl">verified_user</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Status da Conta</h3>
            <p className="text-sm text-slate-500 dark:text-text-secondary mt-1">Plano Diário</p>
          </div>
        </div>
      );
    }

    if (viewMode === 'diario') {
      return (
        <div className="flex flex-col gap-4 animate-in slide-in-from-right duration-500">
          {/* Card de Estatísticas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-1 relative overflow-hidden">
              <span className="text-3xl font-black tracking-tighter">{stats.total}</span>
              <span className="text-[10px] font-bold uppercase opacity-80">Orações</span>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg shadow-rose-500/20 flex flex-col items-center justify-center gap-1 relative overflow-hidden">
              <span className="text-3xl font-black tracking-tighter">{stats.favoritos}</span>
              <span className="text-[10px] font-bold uppercase opacity-80">Favoritas</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/20 flex flex-col items-center justify-center gap-1 relative overflow-hidden group w-full">
            <div className="absolute -right-4 -top-4 bg-white/10 size-20 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black tracking-tighter">{stats.streak}</span>
              <span className="material-symbols-outlined animate-bounce text-yellow-200 text-3xl">local_fire_department</span>
            </div>
            <span className="text-xs font-bold uppercase opacity-90">Dias Seguidos</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        <button
          onClick={onAddClick}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 group"
        >
          <span className="material-symbols-outlined transition-transform group-hover:rotate-90">add</span>
          <span>Adicionar Nova Oração</span>
        </button>

        <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg">Orações de Hoje</h3>
          </div>

          {prayers.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-surface-dark border border-dashed border-slate-200 dark:border-surface-border rounded-xl">
              <p className="text-slate-500 dark:text-text-secondary text-sm">Nenhuma oração hoje.</p>
            </div>
          ) : (
            prayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                onToggleFavorite={onToggleFavorite}
                onEdit={() => onEditPrayer(prayer)}
                onDelete={() => onDeletePrayer(prayer.id)}
                variant="compact"
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-full xl:w-[400px] shrink-0 flex flex-col gap-6">
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white">
          {viewMode === 'chat' ? 'Mentor IA' : viewMode === 'configuracoes' ? 'Preferências' : viewMode === 'diario' ? 'Sua Jornada' : 'Foco Diário'}
        </h2>
        {viewMode === 'calendario' && (
          <span className="text-primary font-medium bg-primary/10 px-3 py-1 rounded-full text-sm capitalize">
            {selectedDateLabel}
          </span>
        )}
      </div>

      {renderContent()}
    </aside>
  );
};

export default Sidebar;
