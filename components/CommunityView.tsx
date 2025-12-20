
import React, { useState } from 'react';

interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  category: string;
  time: string;
  amenCount: number;
  prayingCount: number;
  isAmen?: boolean;
  isPraying?: boolean;
}

const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'c1',
    author: 'Maria S.',
    avatar: 'https://picsum.photos/seed/maria/100',
    content: 'Peço orações pela saúde do meu pai que fará uma cirurgia cardíaca amanhã. Que as mãos dos médicos sejam guiadas pelo Senhor.',
    category: 'INTERCESSÃO',
    time: '2 horas atrás',
    amenCount: 24,
    prayingCount: 12
  },
  {
    id: 'c2',
    author: 'João P.',
    avatar: 'https://picsum.photos/seed/joao/100',
    content: 'Hoje celebro 1 ano de sobriedade! Toda honra e glória a Deus que me sustentou nos momentos mais sombrios.',
    category: 'GRATIDÃO',
    time: '5 horas atrás',
    amenCount: 156,
    prayingCount: 5
  },
  {
    id: 'c3',
    author: 'Anônimo',
    avatar: 'https://picsum.photos/seed/anon/100',
    content: 'Passando por uma crise de ansiedade muito forte. Por favor, orem por paz na minha mente e coração.',
    category: 'URGENTE',
    time: '8 horas atrás',
    amenCount: 45,
    prayingCount: 38
  }
];

interface CommunityViewProps {
  searchQuery: string;
}

const CommunityView: React.FC<CommunityViewProps> = ({ searchQuery }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_POSTS);

  const toggleAmen = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          isAmen: !p.isAmen,
          amenCount: p.isAmen ? p.amenCount - 1 : p.amenCount + 1
        };
      }
      return p;
    }));
  };

  const togglePraying = (id: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          isPraying: !p.isPraying,
          prayingCount: p.isPraying ? p.prayingCount - 1 : p.prayingCount + 1
        };
      }
      return p;
    }));
  };

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="flex-1 flex flex-col gap-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Comunidade de Fé</h1>
        <p className="text-slate-500 dark:text-text-secondary text-sm">Apoie e receba apoio em oração.</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-surface-border shadow-sm flex items-center gap-4">
          <img src="https://picsum.photos/seed/spirit-user/100" className="size-10 rounded-full" alt="User" />
          <button className="flex-1 text-left px-4 py-2 bg-slate-50 dark:bg-background-dark rounded-xl text-slate-400 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-surface-border">
            Compartilhe um pedido ou agradecimento...
          </button>
        </div>

        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-surface-border shadow-sm overflow-hidden group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img src={post.avatar} className="size-12 rounded-full ring-2 ring-primary/10" alt={post.author} />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{post.author}</h4>
                    <span className="text-xs text-slate-400 dark:text-text-secondary">{post.time}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${
                  post.category === 'URGENTE' ? 'bg-rose-500/10 text-rose-500' : 
                  post.category === 'GRATIDÃO' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-primary/10 text-primary'
                }`}>
                  {post.category}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-lg italic font-serif">
                "{post.content}"
              </p>
            </div>
            
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-surface-border flex items-center gap-6">
              <button 
                onClick={() => toggleAmen(post.id)}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.isAmen ? 'text-primary' : 'text-slate-400 dark:text-text-secondary hover:text-primary'}`}
              >
                <span className={post.isAmen ? 'material-symbols-filled' : 'material-symbols-outlined'}>
                  thumb_up
                </span>
                <span>{post.amenCount} Amém</span>
              </button>
              
              <button 
                onClick={() => togglePraying(post.id)}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.isPraying ? 'text-blue-500' : 'text-slate-400 dark:text-text-secondary hover:text-blue-500'}`}
              >
                <span className={post.isPraying ? 'material-symbols-filled' : 'material-symbols-outlined'}>
                  volunteer_activism
                </span>
                <span>{post.prayingCount} Orando</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommunityView;
