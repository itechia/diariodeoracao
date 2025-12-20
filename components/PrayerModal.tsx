
import React, { useState } from 'react';
import { PrayerCategory, Prayer } from '../types';
import { suggestPrayer } from '../services/geminiService';

interface PrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prayer: Omit<Prayer, 'id' | 'isFavorite'>) => void;
  initialDate: string;
  initialData?: Prayer | null;
}

const PrayerModal: React.FC<PrayerModalProps> = ({ isOpen, onClose, onSubmit, initialDate, initialData }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PrayerCategory>(PrayerCategory.GRATIDAO);
  const [date, setDate] = useState(initialDate);
  const [isSuggesting, setIsSuggesting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
        setCategory(initialData.category);
        setDate(initialData.date.split('T')[0]);
      } else {
        setTitle('');
        setContent('');
        setCategory(PrayerCategory.GRATIDAO);
        setDate(initialDate);
      }
    }
  }, [isOpen, initialData, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    onSubmit({ title, content, category, date: new Date(date + 'T12:00:00').toISOString() });

    // Close handled by parent, but good to reset? Parent usually closes.
  };

  const handleAISuggestion = async () => {
    setIsSuggesting(true);
    const suggestion = await suggestPrayer(category);
    setContent(suggestion);
    setIsSuggesting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{initialData ? 'Editar Oração' : 'Nova Oração'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-text-secondary dark:hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 dark:text-text-secondary mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
              placeholder="ex: Saúde da família"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 dark:text-text-secondary mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PrayerCategory)}
                className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
              >
                {Object.values(PrayerCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 dark:text-text-secondary mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-slate-500 dark:text-text-secondary">Sua Oração</label>
              <button
                type="button"
                onClick={handleAISuggestion}
                disabled={isSuggesting}
                className="text-xs text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                {isSuggesting ? 'Pensando...' : 'Sugestão da IA'}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary resize-none"
              placeholder="Escreva sua conversa com Deus..."
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg mt-2"
          >
            {initialData ? 'Salvar Alterações' : 'Salvar Oração'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrayerModal;
