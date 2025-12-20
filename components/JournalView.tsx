import React, { useState, useMemo } from 'react';
import { Prayer, PrayerCategory } from '../types';
import PrayerCard from './PrayerCard';

interface JournalViewProps {
  prayers: Prayer[];
  searchQuery: string;
  onToggleFavorite: (id: string) => void;
  onEditPrayer: (prayer: Prayer) => void;
  onDeletePrayer: (id: string) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ prayers, searchQuery, onToggleFavorite, onEditPrayer, onDeletePrayer }) => {
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | 'TODAS'>('TODAS');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const filteredPrayers = useMemo(() => {
    return prayers
      .filter(p => selectedCategory === 'TODAS' || p.category === selectedCategory)
      .filter(p => !showOnlyFavorites || p.isFavorite)
      .filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [prayers, selectedCategory, searchQuery, showOnlyFavorites]);

  return (
    <section className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Seu Diário</h1>
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showOnlyFavorites
              ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
              : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-text-secondary border-slate-200 dark:border-surface-border hover:border-red-400 hover:text-red-400'
              }`}
          >
            <span className={showOnlyFavorites ? 'material-symbols-filled text-sm' : 'material-symbols-outlined text-sm'}>
              favorite
            </span>
            <span>{showOnlyFavorites ? 'Ver Todas' : 'Apenas Favoritas'}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('TODAS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === 'TODAS' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-text-secondary border border-slate-200 dark:border-surface-border'}`}
          >
            TODAS
          </button>
          {Object.values(PrayerCategory).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-text-secondary border border-slate-200 dark:border-surface-border'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredPrayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-surface-dark rounded-2xl border border-dashed border-slate-200 dark:border-surface-border">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">
              {showOnlyFavorites ? 'favorite_border' : 'history_edu'}
            </span>
            <p className="text-slate-500 dark:text-text-secondary font-medium px-4">
              {showOnlyFavorites
                ? 'Você ainda não marcou nenhuma oração como favorita nesta categoria.'
                : 'Nenhuma entrada encontrada para os filtros aplicados.'}
            </p>
          </div>
        ) : (
          filteredPrayers.map((p) => (
            <PrayerCard
              key={p.id}
              prayer={p}
              onToggleFavorite={onToggleFavorite}
              onEdit={() => onEditPrayer(p)}
              onDelete={() => onDeletePrayer(p.id)}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default JournalView;
