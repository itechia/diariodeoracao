
export enum PrayerCategory {
  GRATIDAO = 'GRATIDÃO',
  INTERCESSAO = 'INTERCESSÃO',
  CRESCIMENTO = 'CRESCIMENTO',
  CONFISSAO = 'CONFISSÃO',
  FORCA = 'FORÇA'
}

export interface Prayer {
  id: string;
  title: string;
  content: string;
  category: PrayerCategory;
  date: string; // Formato ISO
  isFavorite: boolean;
  images?: string[];
}

export interface Verse {
  text: string;
  reference: string;
  imageUrl?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  prayers: Prayer[];
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export type ViewMode = 'calendario' | 'diario' | 'configuracoes' | 'chat';
