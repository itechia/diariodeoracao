
import React, { useState, useEffect } from 'react';

import { User } from '../types';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onUpdateUser: (user: User) => void;
  user: User | null;
}

import { supabase } from '../services/supabase';

// ...

const SettingsView: React.FC<SettingsViewProps> = ({ theme, toggleTheme, onLogout, onDeleteAccount, onUpdateUser, user }) => {
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update Profiles Table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: (await supabase.auth.getUser()).data.user?.id,
          full_name: name,
          avatar_url: avatarUrl,
          updated_at: new Date()
        });

      if (error) throw error;

      // Update App State
      onUpdateUser({ ...user, name, avatar: avatarUrl });
      alert('Perfil atualizado com sucesso!');

    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Erro ao salvar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex-1 flex flex-col gap-8 animate-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-slate-500 dark:text-text-secondary text-sm">Gerencie seu perfil e dados.</p>
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
              onClick={handleSaveProfile}
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
