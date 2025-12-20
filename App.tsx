
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Sidebar from './components/Sidebar';
import JournalView from './components/JournalView';
import SettingsView from './components/SettingsView';
import ChatView from './components/ChatView';
import BottomNav from './components/BottomNav';
import PrayerModal from './components/PrayerModal';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import { Prayer, PrayerCategory, Verse } from './types';
import { getVerseOfTheDay } from './services/geminiService';
import { supabase } from './services/supabase';



const App: React.FC = () => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'calendario' | 'diario' | 'configuracoes' | 'chat'>('calendario');
  const [verse, setVerse] = useState<Verse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchVerse = async () => {
      const v = await getVerseOfTheDay();
      setVerse(v);
    };
    fetchVerse();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const prayersForSelectedDate = useMemo(() => {
    return prayers.filter(p =>
      new Date(p.date).toDateString() === selectedDate.toDateString()
    );
  }, [prayers, selectedDate]);



  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [user, setUser] = useState<{ name: string, email: string, avatar?: string } | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        fetchProfile(session.user);
        fetchPrayers();
      }
    });

    // Ouvir mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const wasAuthenticated = isAuthenticated;
      setIsAuthenticated(!!session);
      if (session?.user) {
        if (!wasAuthenticated) {
          fetchProfile(session.user);
          fetchPrayers();
          setCurrentView(prev => prev === 'configuracoes' ? 'calendario' : prev);
        }
      } else {
        setUser(null);
        setPrayers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (sessionUser: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (data) {
      setUser({
        name: data.full_name || sessionUser.user_metadata.name || 'Usuário',
        email: sessionUser.email || '',
        avatar: data.avatar_url || sessionUser.user_metadata.avatar_url
      });
    } else {
      // Profile doesn't exist (old user), create it
      const newProfile = {
        id: sessionUser.id,
        full_name: sessionUser.user_metadata.name || 'Usuário',
        avatar_url: sessionUser.user_metadata.avatar_url
      };

      const { error: insertError } = await supabase.from('profiles').insert(newProfile);

      if (!insertError) {
        setUser({
          name: newProfile.full_name,
          email: sessionUser.email || '',
          avatar: newProfile.avatar_url
        });
      } else {
        // Fallback
        setUser({
          name: sessionUser.user_metadata.name || 'Usuário',
          email: sessionUser.email || '',
        });
      }
    }
  };

  const fetchPrayers = async () => {
    const { data, error } = await supabase
      .from('prayers')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching prayers:', error);
    } else if (data) {
      const mappedPrayers: Prayer[] = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.category as PrayerCategory, // Assuming DB stores valid enum strings
        date: p.date,
        isFavorite: p.is_favorite,
      }));
      setPrayers(mappedPrayers);
    }
  };

  const handleLogin = (email: string) => {
    // A mudança de estado é tratada pelo onAuthStateChange
  };

  const handleRegister = (name: string, email: string) => {
    // A mudança de estado é tratada pelo onAuthStateChange e user metadata
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // State updates handled by onAuthStateChange
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Tem certeza? Isso apagará todos os seus dados e orações deste dispositivo permanentemente.')) {
      if (user) {
        // Delete prayers from DB
        const { error } = await supabase.from('prayers').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all matches for user (RLS handles filtering)
        if (error) console.error("Error deleting data", error);
      }
      await supabase.auth.signOut();
      localStorage.clear();
      // State updates handled by onAuthStateChange
    }
  };

  const handleSavePrayer = async (prayerData: Omit<Prayer, 'id' | 'isFavorite'>) => {
    setIsModalOpen(false);

    if (editingPrayer) {
      // Update Logic
      const updatedPrayer = { ...editingPrayer, ...prayerData };

      // Optimistic
      setPrayers(current => current.map(p => p.id === updatedPrayer.id ? updatedPrayer : p));
      setEditingPrayer(null);

      // Supabase
      const { error } = await supabase.from('prayers').update({
        title: prayerData.title,
        content: prayerData.content,
        category: prayerData.category,
        date: prayerData.date
      }).eq('id', updatedPrayer.id);

      if (error) {
        console.error("Error updating prayer:", error);
        alert("Erro ao editar oração.");
        fetchPrayers(); // Revert
      }

    } else {
      // Create Logic
      // Optimistic update
      const tempId = Math.random().toString(36).substr(2, 9);
      const prayer: Prayer = {
        ...prayerData,
        id: tempId,
        isFavorite: false,
      };
      setPrayers([prayer, ...prayers]);

      // Save to Supabase
      const { data, error } = await supabase.from('prayers').insert({
        title: prayerData.title,
        content: prayerData.content,
        category: prayerData.category,
        date: prayerData.date,
        is_favorite: false,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }).select().single();

      if (error) {
        console.error("Error saving prayer:", error);
        alert("Erro ao salvar oração. Verifique sua conexão.");
        // Revert optimistic update? Or just let it fail silently in UI but log error.
        setPrayers(current => current.filter(p => p.id !== tempId));
      } else if (data) {
        // Replace temp ID with real ID
        setPrayers(current => current.map(p => p.id === tempId ? { ...p, id: data.id } : p));
      }
    }
  };

  const handleEditPrayer = (prayer: Prayer) => {
    setEditingPrayer(prayer);
    setIsModalOpen(true);
  };

  const handleDeletePrayer = async (id: string) => {
    // Optimistic Delete
    setPrayers(current => current.filter(p => p.id !== id));

    // Supabase Delete
    const { error } = await supabase.from('prayers').delete().eq('id', id);

    if (error) {
      console.error("Error deleting prayer:", error);
      alert("Erro ao excluir oração.");
      fetchPrayers(); // Revert
    }
  };

  const toggleFavorite = async (id: string) => {
    const prayerToUpdate = prayers.find(p => p.id === id);
    if (!prayerToUpdate) return;

    const newStatus = !prayerToUpdate.isFavorite;

    // Optimistic Update
    setPrayers(prayers.map(p =>
      p.id === id ? { ...p, isFavorite: newStatus } : p
    ));

    // Update Supabase
    const { error } = await supabase.from('prayers').update({ is_favorite: newStatus }).eq('id', id);
    if (error) {
      console.error("Error updating favorite:", error);
      // Revert on error
      setPrayers(current => current.map(p => p.id === id ? { ...p, isFavorite: !newStatus } : p));
    }
  };

  const handleUpdateUser = (updatedUser: { name: string; email: string; avatar?: string }) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser)); // Keep persistence for basic user info if needed, or rely on auth.
  };

  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <LoginView
          onLogin={handleLogin}
          onNavigateToRegister={() => setAuthView('register')}
        />
      );
    } else {
      return (
        <RegisterView
          onRegister={handleRegister}
          onNavigateToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        toggleTheme={toggleTheme}
        currentView={currentView}
        onViewChange={setCurrentView}
        userAvatar={user?.avatar}
      />

      <main className="flex-1 flex justify-center py-6 px-4 lg:px-8 bg-background-light dark:bg-background-dark pb-24 md:pb-6">
        <div className="w-full max-w-[1400px] flex flex-col xl:flex-row gap-8">
          {currentView === 'calendario' && (
            <Calendar
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              prayers={prayers}
              onAddClick={() => { setEditingPrayer(null); setIsModalOpen(true); }}
            />
          )}
          {currentView === 'diario' && (
            <JournalView
              prayers={prayers}
              searchQuery={searchQuery}
              onToggleFavorite={toggleFavorite}
              onEditPrayer={handleEditPrayer}
              onDeletePrayer={handleDeletePrayer}
            />
          )}
          {currentView === 'configuracoes' && (
            <SettingsView
              theme={theme}
              toggleTheme={toggleTheme}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onUpdateUser={handleUpdateUser}
              user={user}
            />
          )}
          {currentView === 'chat' && (
            <ChatView
              prayers={prayers}
              userName={user?.name || 'Filho(a) de Deus'}
            />
          )}

          <Sidebar
            verse={verse}
            prayers={prayersForSelectedDate}
            allPrayers={prayers}
            onAddClick={() => { setEditingPrayer(null); setIsModalOpen(true); }}
            onToggleFavorite={toggleFavorite}
            onEditPrayer={handleEditPrayer}
            onDeletePrayer={handleDeletePrayer}
            selectedDateLabel={selectedDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
            viewMode={currentView}
          />
        </div>
      </main>

      <BottomNav currentView={currentView} onViewChange={setCurrentView} />

      {isModalOpen && (
        <PrayerModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingPrayer(null); }}
          onSubmit={handleSavePrayer}
          initialDate={selectedDate.toISOString().split('T')[0]}
          initialData={editingPrayer}
        />
      )}
    </div>
  );
};

export default App;
