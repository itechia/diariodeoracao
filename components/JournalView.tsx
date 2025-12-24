import React, { useState, useMemo } from 'react';
import { Prayer, Category } from '../types';
import PrayerCard from './PrayerCard';

interface JournalViewProps {
  prayers: Prayer[];
  categories: Category[];
  searchQuery: string;
  onToggleFavorite: (id: string) => void;
  onEditPrayer: (prayer: Prayer) => void;
  onDeletePrayer: (id: string) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ prayers, categories, searchQuery, onToggleFavorite, onEditPrayer, onDeletePrayer }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | 'TODAS'>('TODAS');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredPrayers = useMemo(() => {
    return prayers
      .filter(p => selectedCategory === 'TODAS' || p.category === selectedCategory)
      .filter(p => !showOnlyFavorites || p.isFavorite)
      .filter(p => {
        if (!startDate && !endDate) return true;
        const pDate = new Date(p.date.split('T')[0]).getTime();
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).getTime() : Infinity;
        return pDate >= start && pDate <= end;
      })
      .filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [prayers, selectedCategory, searchQuery, showOnlyFavorites, startDate, endDate]);

  return (
    <section className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Seu Diário</h1>
          <div className="flex gap-2">
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
        </div>

        {/* Date Filter */}
        <div className="flex gap-2 items-center bg-white dark:bg-surface-dark p-2 rounded-xl border border-slate-200 dark:border-surface-border overflow-x-auto">
          <span className="material-symbols-outlined text-slate-400 ml-2">calendar_month</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0"
            placeholder="Início"
          />
          <span className="text-slate-300">-</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0"
            placeholder="Fim"
          />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-auto text-slate-400 hover:text-red-500 px-2">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('TODAS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === 'TODAS' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-text-secondary border border-slate-200 dark:border-surface-border'}`}
          >
            TODAS
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedCategory === cat.name ? `bg-${cat.colorTheme}-500 text-white shadow-md` : 'bg-white dark:bg-surface-dark text-slate-500 dark:text-text-secondary border border-slate-200 dark:border-surface-border'}`}
            >
              {cat.name}
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
              categories={categories}
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
