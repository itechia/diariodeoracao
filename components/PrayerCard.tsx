import React from 'react';
import { Prayer, Category } from '../types';

import ReactMarkdown from 'react-markdown';

interface PrayerCardProps {
    prayer: Prayer;
    categories?: Category[];
    onToggleFavorite: (id: string) => void;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
    variant?: 'default' | 'compact';
}

const PrayerCard: React.FC<PrayerCardProps> = ({
    prayer,
    categories,
    onToggleFavorite,
    onEdit,
    onDelete,
    className = '',
    variant = 'default'
}) => {
    const isCompact = variant === 'compact';

    // Find category color
    const category = categories?.find(c => c.name === prayer.category);
    const colorTheme = category?.colorTheme || 'slate';

    // Construct classes
    const pillClass = `bg-${colorTheme}-100 text-${colorTheme}-700 dark:bg-${colorTheme}-500/20 dark:text-${colorTheme}-300`;
    const dotClass = `bg-${colorTheme}-500`;

    return (
        <div
            onClick={onEdit}
            className={`bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-border hover:border-primary/50 transition-all cursor-pointer group shadow-sm overflow-hidden ${isCompact ? 'p-0' : 'p-6 hover:shadow-md'
                } ${className}`}
        >
            {/* Image Preview - Cover Style for Compact */}
            {prayer.images && prayer.images.length > 0 && isCompact && (
                <div className="h-28 w-full relative">
                    <img
                        src={prayer.images[0]}
                        alt="Capa"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span className={`absolute bottom-2 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-800 shadow-sm`}>
                        {prayer.category}
                    </span>
                </div>
            )}

            <div className={isCompact ? 'p-4' : ''}>
                <div className={`flex justify-between items-start ${isCompact ? 'mb-2' : 'mb-4'}`}>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            {/* Category Pill - Hide if showing Image Cover in Compact */}
                            {(!isCompact || (isCompact && (!prayer.images || prayer.images.length === 0))) && (
                                isCompact ? (
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${pillClass}`}>
                                        {prayer.category}
                                    </span>
                                ) : (
                                    <span className={`size-2 rounded-full ${dotClass}`}></span>
                                )
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
                        {/* Default Actions (Edit/Delete) */}
                        {onEdit && !isCompact && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="text-slate-300 dark:text-gray-500 hover:text-primary transition-colors p-1"
                                title="Editar"
                            >
                                <span className="material-symbols-outlined text-2xl">edit</span>
                            </button>
                        )}

                        {/* Compact specific actions or shared actions */}
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

                <div className={`text-slate-500 dark:text-text-secondary ${isCompact ? 'text-sm line-clamp-3' : 'leading-relaxed text-slate-600 dark:text-slate-300'}`}>
                    {isCompact ? (
                        // Strip markdown for compact view text-only preview
                        prayer.content.replace(/!\[.*?\]\(.*?\)/g, '').slice(0, 100).trim() + (prayer.content.length > 100 ? '...' : '')
                    ) : (
                        <>
                            {/* Force render images if they exist and are not showing via markdown (or just show as gallery at top) */}
                            {prayer.images && prayer.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {prayer.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Anexo ${idx + 1}`}
                                            className={`rounded-lg object-cover w-full h-48 shadow-sm border border-slate-100 dark:border-white/10 ${prayer.images?.length === 1 ? 'col-span-2 h-64' : ''}`}
                                        />
                                    ))}
                                </div>
                            )}

                            <ReactMarkdown
                                components={{
                                    /* Hide images in markdown if we are forcing them at the top? 
                                       Or assume user might have placed them nicely? 
                                       Let's keep markdown images but maybe the top gallery is for "Attached" images. 
                                       Actually, if we just render them, duplicate is better than none. 
                                       But to be smart, we could check if content contains the URL.
                                    */
                                    img: ({ node, ...props }) => {
                                        // If the image is already in the `images` array, we might be duplicating it if we rendered the gallery.
                                        // But if the user placed it specifically, they want it there.
                                        // The issue is "images not showing". 
                                        // If I render the gallery, I ensure they show.
                                        // If I return <></> here, I break inline positioning.
                                        // Let's just keep both for now, but usually the 'images' array is the source of truth for "attachments".
                                        return (
                                            <img
                                                {...props}
                                                className="w-full rounded-lg my-4 shadow-sm border border-slate-100 dark:border-white/10"
                                                style={{ maxHeight: '400px', objectFit: 'cover' }}
                                            />
                                        )
                                    },
                                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0 whitespace-pre-wrap" {...props} />
                                }}
                            >
                                {prayer.content}
                            </ReactMarkdown>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrayerCard;
