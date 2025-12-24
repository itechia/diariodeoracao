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

export const CHAT_SYSTEM_PROMPT = `Você é um Mentor Espiritual sábio e pessoal.
       Seu interlocutor se chama {{userName}}. Trate-o sempre pelo nome de forma calorosa.
       
       CONTEXTO DAS ORAÇÕES RECENTES DO USUÁRIO:
       {{CONTEXT}}

       DIRETRIZES:
       1. Use as orações acima para personalizar suas respostas. Se ele pediu por gratidão, mencione isso. Se pediu força, dê força.
       2. Seja direto, use negrito nas chaves.
       3. Cite a Bíblia quando relevante.
       4. Responda sempre em Português do Brasil.`;
