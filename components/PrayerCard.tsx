import React from 'react';
import { Prayer } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface PrayerCardProps {
    prayer: Prayer;
    onToggleFavorite: (id: string) => void;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
    variant?: 'default' | 'compact';
}

const PrayerCard: React.FC<PrayerCardProps> = ({
    prayer,
    onToggleFavorite,
    onEdit,
    onDelete,
    className = '',
    variant = 'default'
}) => {
    const isCompact = variant === 'compact';
    const categoryColor = CATEGORY_COLORS[prayer.category];

    return (
        <div
            className={`bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-border hover:border-primary/50 transition-all cursor-pointer group shadow-sm ${isCompact ? 'p-4' : 'p-6 hover:shadow-md'
                } ${className}`}
        >
            <div className={`flex justify-between items-start ${isCompact ? 'mb-2' : 'mb-4'}`}>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        {!isCompact ? (
                            <span className={`size-2 rounded-full ${categoryColor.bg}`}></span>
                        ) : (
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${categoryColor.bgLight} ${categoryColor.text}`}>
                                {prayer.category}
                            </span>
                        )}

                        {!isCompact && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-text-secondary">
                                {prayer.category} • {new Date(prayer.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                    <h4 className={`${isCompact ? 'text-base mb-1' : 'text-xl'
                        } font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors`}>
                        {prayer.title}
                    </h4>
                </div>

                <div className="flex gap-1">
                    {onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="text-slate-300 dark:text-gray-500 hover:text-primary transition-colors p-1"
                            title="Editar"
                        >
                            <span className={`material-symbols-outlined ${isCompact ? 'text-[20px]' : 'text-2xl'}`}>
                                edit
                            </span>
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Tem certeza que deseja excluir esta oração?')) {
                                    onDelete();
                                }
                            }}
                            className="text-slate-300 dark:text-gray-500 hover:text-red-500 transition-colors p-1"
                            title="Excluir"
                        >
                            <span className={`material-symbols-outlined ${isCompact ? 'text-[20px]' : 'text-2xl'}`}>
                                delete
                            </span>
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(prayer.id);
                        }}
                        className={`transition-colors p-1 ${prayer.isFavorite
                            ? 'text-red-500'
                            : 'text-slate-300 dark:text-gray-500 hover:text-red-400'
                            }`}
                        title={prayer.isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
                    >
                        <span className={`${prayer.isFavorite ? 'material-symbols-filled' : 'material-symbols-outlined'} ${isCompact ? 'text-[20px]' : 'text-2xl'
                            }`}>
                            favorite
                        </span>
                    </button>
                </div>
            </div>
            <p className={`text-slate-500 dark:text-text-secondary ${isCompact ? 'text-sm line-clamp-2' : 'leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300'
                }`}>
                {prayer.content}
            </p>
        </div>
    );
};

export default PrayerCard;
