import { PrayerCategory } from './types';

export const CATEGORY_COLORS = {
    [PrayerCategory.GRATIDAO]: {
        bg: 'bg-amber-500',
        bgLight: 'bg-amber-500/10',
        text: 'text-amber-600 dark:text-amber-500',
    },
    [PrayerCategory.INTERCESSAO]: {
        bg: 'bg-purple-500',
        bgLight: 'bg-purple-500/10',
        text: 'text-purple-600 dark:text-purple-500',
    },
    [PrayerCategory.CRESCIMENTO]: {
        bg: 'bg-emerald-500',
        bgLight: 'bg-emerald-500/10',
        text: 'text-emerald-600 dark:text-emerald-500',
    },
    [PrayerCategory.CONFISSAO]: {
        bg: 'bg-rose-500',
        bgLight: 'bg-rose-500/10',
        text: 'text-rose-600 dark:text-rose-500',
    },
    [PrayerCategory.FORCA]: {
        bg: 'bg-primary',
        bgLight: 'bg-primary/10',
        text: 'text-primary',
    },
};
