
import React, { useState, useEffect } from 'react';

import { User, Category } from '../types';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onUpdateUser: (user: User) => void;
  user: User | null;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

import { supabase } from '../services/supabase';

const COLORS = [
  { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
  { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Cyan', value: 'cyan', class: 'bg-cyan-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
];

const SettingsView: React.FC<SettingsViewProps> = ({ theme, toggleTheme, onLogout, onDeleteAccount, onUpdateUser, user, categories, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Categorias
  const [editingId, setEditingId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('emerald');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatar || '');
    }
  }, [user]);

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSaveCategory = () => {
    if (!catName.trim()) return;

    if (editingId) {
      // Update existing
      const categoryToUpdate = categories.find(c => c.id === editingId);
      if (categoryToUpdate) {
        onUpdateCategory({
          ...categoryToUpdate,
          name: catName.toUpperCase(),
          colorTheme: catColor
        });
      }
      setEditingId(null);
    } else {
      // Add new
      onAddCategory({
        name: catName.toUpperCase(),
        colorTheme: catColor
      });
    }
    setCatName('');
    setCatColor('emerald');
  };

  const startEditing = (cat: Category) => {
    setEditingId(cat.id);
    setCatName(cat.name);
    setCatColor(cat.colorTheme);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setCatName('');
    setCatColor('emerald');
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Excluir esta categoria? Orações existentes manterão o nome mas perderão a cor.')) {
      onDeleteCategory(id);
      if (editingId === id) cancelEditing();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compression: JPEG, 0.7 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setAvatarUrl(dataUrl);
          }
          setIsUploading(false);
        };
        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        console.error("Erro ao ler arquivo");
        setIsUploading(false);
        alert("Erro ao processar imagem.");
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (colorOverride?: string) => {
    if (!user) return;
    const colorToSave = colorOverride || user.accentColor || '#2badee';

    // If it's just a color update, don't show full loading state for better UX, or maybe yes?
    // Let's allow background save for color if override is present
    if (!colorOverride) setIsSaving(true);

    try {
      // Update Profiles Table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: (await supabase.auth.getUser()).data.user?.id,
          full_name: name,
          avatar_url: avatarUrl,
          accent_color: colorToSave,
          updated_at: new Date()
        });

      if (error) throw error;

      // Update App State
      onUpdateUser({ ...user, name, avatar: avatarUrl, accentColor: colorToSave });

      if (!colorOverride) alert('Perfil atualizado com sucesso!');

    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (!colorOverride) alert('Erro ao salvar perfil.');
    } finally {
      if (!colorOverride) setIsSaving(false);
    }
  };

  return (
    <section className="flex-1 flex flex-col gap-8 animate-in zoom-in-95 duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-slate-500 dark:text-text-secondary text-sm">Gerencie seu perfil.</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* Perfil */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-surface-border shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Seu Perfil
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <img
                src={avatarUrl || "https://picsum.photos/seed/spirit-user/200"}
                className={`size-24 rounded-full ring-4 ring-primary/20 object-cover ${isUploading ? 'opacity-50' : ''}`}
                alt="Avatar"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                </div>
              )}
            </div>
            <div className="flex-1 w-full flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">Nome de Exibição</label>
                <input
                  type="text"
                  value={name}
                  onChange={handleDisplayChange}
                  className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={user?.email || "usuario@exemplo.com"}
                  disabled
                  className="w-full bg-slate-100 dark:bg-background-dark/50 border-slate-200 dark:border-surface-border rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleSaveProfile()}
              disabled={isSaving || isUploading}
              className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
            >
              {isSaving ? (
                <>
                  <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>

        {/* Categorias */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-surface-border shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">label</span>
            Suas Etiquetas
          </h3>

          <div className="flex flex-col gap-4 mb-6">
            {categories.map(cat => (
              <div key={cat.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${editingId === cat.id ? 'bg-primary/5 border-primary' : 'bg-slate-50 dark:bg-black/20 border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <div className={`size-4 rounded-full bg-${cat.colorTheme}-500 shadow-sm`}></div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEditing(cat)} className="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-white dark:hover:bg-surface-dark rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 hover:bg-white dark:hover:bg-surface-dark rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end border-t border-slate-100 dark:border-white/5 pt-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">{editingId ? 'Editar Etiqueta' : 'Nova Etiqueta'}</label>
              <input
                type="text"
                placeholder="Ex: MILAGRES"
                value={catName}
                onChange={e => setCatName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white uppercase"
              />
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-xs font-black uppercase text-slate-400 mb-1">Cor</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCatColor(c.value)}
                    className={`size-8 rounded-full ${c.class} transition-transform hover:scale-110 ${catColor === c.value ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-surface-dark' : ''}`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {editingId && (
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-slate-100 dark:bg-surface-border text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:opacity-90 transition-all"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSaveCategory}
                disabled={!catName.trim()}
                className="flex-1 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>

        {/* Aparência */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-surface-border shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">palette</span>
            Aparência
          </h3>

          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Tema</label>
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-black/20 rounded-xl w-fit">
                <button
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${theme === 'light' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-lg">light_mode</span>
                  Claro
                </button>
                <button
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${theme === 'dark' ? 'bg-surface-dark shadow text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-lg">dark_mode</span>
                  Escuro
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Cor de Destaque</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Azul Celeste', value: '#2badee' },
                  { name: 'Roxo Real', value: '#8b5cf6' },
                  { name: 'Rosa Vibrante', value: '#ec4899' },
                  { name: 'Laranja Solar', value: '#f97316' },
                  { name: 'Verde Esperança', value: '#10b981' },
                  { name: 'Dourado', value: '#eab308' },
                ].map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      if (user) {
                        onUpdateUser({ ...user, accentColor: color.value });
                        document.documentElement.style.setProperty('--primary-color', color.value);
                        handleSaveProfile(color.value);
                      }
                    }}
                    className={`size-10 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${user?.accentColor === color.value || (color.value === '#2badee' && !user?.accentColor) ? 'border-slate-900 dark:border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {(user?.accentColor === color.value || (color.value === '#2badee' && !user?.accentColor)) && (
                      <span className="material-symbols-outlined text-white text-lg drop-shadow-md">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Zona de Perigo (Agora Excluir Conta) */}
        <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-rose-600 dark:text-rose-500 mb-4">Zona de Perigo</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Ações irreversíveis. Tenha cuidado.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sair da Conta
            </button>
            <button
              onClick={onDeleteAccount}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
            >
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              Excluir Minha Conta
            </button>
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-xs text-slate-400">Diário de Oração v1.3.0 • Feito com fé</p>
        </div>
      </div>
    </section>
  );
};

export default SettingsView;
