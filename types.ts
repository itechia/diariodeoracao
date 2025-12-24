
export interface Category {
  id: string;
  name: string;
  colorTheme: string; // e.g., 'emerald', 'blue', 'rose'
}

export interface Prayer {
  id: string;
  title: string;
  content: string;
  category: string; // Dynamic category name
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
