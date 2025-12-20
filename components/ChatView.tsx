import React, { useState, useRef, useEffect } from 'react';
import { getChatModel } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Prayer } from '../types';
import { supabase } from '../services/supabase';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface ChatViewProps {
  prayers: Prayer[];
  userName: string;
}

const ChatView: React.FC<ChatViewProps> = ({ prayers, userName }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Session Editing State
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Load Sessions
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSessions(data);
  };

  // 2. Load Messages for Session
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data.map((m: any) => ({
          id: m.id,
          role: m.role,
          text: m.content,
          timestamp: new Date(m.created_at)
        })));
      }
    };
    loadMessages();
  }, [currentSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const createSession = async (firstMessage: string) => {
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) throw error;
    setSessions([data, ...sessions]);
    return data.id;
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Excluir esta conversa?")) return;

    await supabase.from('chat_sessions').delete().eq('id', id);
    setSessions(sessions.filter(s => s.id !== id));
    if (currentSessionId === id) setCurrentSessionId(null);
  };

  const startEditing = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const saveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSessionId) return;

    await supabase.from('chat_sessions').update({ title: editTitle }).eq('id', editingSessionId);
    setSessions(sessions.map(s => s.id === editingSessionId ? { ...s, title: editTitle } : s));
    setEditingSessionId(null);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const tempId = Date.now().toString();
    const userMessage: Message = { id: tempId, role: 'user', text, timestamp: new Date() };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createSession(text);
        setCurrentSessionId(sessionId);
      }

      if (user && sessionId) {
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          session_id: sessionId,
          role: 'user',
          content: text
        });
      }

      const prayersSummary = prayers
        .slice(0, 8)
        .map(p => `Título: ${p.title}\nConteúdo: ${p.content}\nCategoria: ${p.category}`)
        .join('\n\n');

      const model = getChatModel();

      const systemPrompt = `Você é um Mentor Espiritual sábio. Nome do usuário: ${userName}.
      Contexto: ${prayersSummary}.
      Seja direto, use negrito nas chaves, cite a Bíblia.`;

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "model", parts: [{ text: "Entendido." }] },
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
        ]
      });

      const result = await chat.sendMessage(text);
      const aiText = result.response.text();

      if (user && sessionId) {
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          session_id: sessionId,
          role: 'model',
          content: aiText
        });
      }

      const modelMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: aiText, timestamp: new Date() };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error: any) {
      console.error('Chat Error:', error);
      const errorMessage = error.message || error.toString();
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'model',
        text: `Erro de conexão: ${errorMessage}. Verifique sua internet.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setIsSidebarOpen(false);
  };

  const suggestions = ["Resumo da minha jornada", "Sugestão de oração", "Versículo de conforto", "Dicas de disciplina"];

  return (
    <div className="flex bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl -mx-4 -my-4 h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] overflow-hidden shadow-sm">

      <aside className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 border-r border-slate-200 dark:border-surface-border bg-slate-50 dark:bg-background-dark/50 absolute md:relative z-20 h-full`}>
        <div className="p-4">
          <button onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span> Novo Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {sessions.map(session => (
            <div key={session.id} className={`group relative flex items-center w-full rounded-lg transition-all ${currentSessionId === session.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-primary font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'}`}>
              {editingSessionId === session.id ? (
                <form onSubmit={saveTitle} className="flex-1 flex items-center px-2 py-1.5">
                  <input autoFocus className="flex-1 bg-white dark:bg-surface-dark px-2 py-1 text-xs rounded border border-primary outline-none" value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={() => setEditingSessionId(null)} />
                </form>
              ) : (
                <button onClick={() => { setCurrentSessionId(session.id); setIsSidebarOpen(false); }} className="flex-1 flex items-center gap-2 px-3 py-2.5 text-left truncate">
                  <span className="material-symbols-outlined text-xs opacity-70">chat_bubble</span>
                  <span className="truncate flex-1 text-sm">{session.title}</span>
                </button>
              )}

              {!editingSessionId && (
                <div className="absolute right-2 flex gap-1 bg-slate-200/50 dark:bg-black/20 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => startEditing(e, session)} className="p-1 hover:text-primary"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                  <button onClick={(e) => deleteSession(e, session.id)} className="p-1 hover:text-red-500"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative w-full">
        <div className="md:hidden p-4 border-b border-slate-100 dark:border-surface-border flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-500"><span className="material-symbols-outlined">menu</span></button>
          <span className="font-bold text-slate-700 dark:text-white">Mentor IA</span>
          <button onClick={handleNewChat} className="p-2 -mr-2 text-primary"><span className="material-symbols-outlined">add_circle</span></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scroll-smooth" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 p-8">
              <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-full mb-4"><span className="material-symbols-outlined text-4xl text-slate-400">psychology</span></div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">Como posso ajudar hoje?</h3>
              <p className="text-sm text-slate-500 max-w-xs mb-8">{userName}, estou pronto para ouvir suas dúvidas ou interceder por você.</p>
              <InputArea
                centered
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                isLoading={isLoading}
                suggestions={suggestions}
              />
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex flex-col max-w-[90%] md:max-w-[85%] ${m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-background-dark text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-surface-border'}`}>
                  <ReactMarkdown components={{ strong: ({ node, ...props }) => <strong className="font-bold" {...props} /> }}>{m.text}</ReactMarkdown>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))
          )}
          {isLoading && <div className="flex gap-2 items-center bg-slate-50 dark:bg-background-dark px-4 py-2 rounded-full w-fit animate-pulse"><span className="text-xs text-primary font-bold">Gerando resposta...</span></div>}
        </div>
        {messages.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-surface-border bg-white dark:bg-surface-dark/50">
            <InputArea
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              isLoading={isLoading}
              suggestions={suggestions}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface InputAreaProps {
  centered?: boolean;
  input: string;
  setInput: (value: string) => void;
  sendMessage: (text: string) => void;
  isLoading: boolean;
  suggestions: string[];
}

const InputArea: React.FC<InputAreaProps> = ({ centered = false, input, setInput, sendMessage, isLoading, suggestions }) => (
  <div className={`w-full ${centered ? 'max-w-3xl mx-auto' : ''}`}>
    <div className={`flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar ${centered ? 'justify-center' : ''}`}>
      {suggestions.map((s, i) => (
        <button key={i} onClick={() => sendMessage(s)} className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-full text-slate-500 dark:text-text-secondary hover:border-primary hover:text-primary transition-all shrink-0">
          {s}
        </button>
      ))}
    </div>
    <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className={`flex items-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border p-1 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all ${centered ? 'shadow-md py-2 px-2' : ''}`}>
      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Fale com seu mentor..." className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white text-sm px-3 h-10" />
      <button type="submit" disabled={!input.trim() || isLoading} className="size-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shrink-0">
        <span className="material-symbols-outlined text-xl">send</span>
      </button>
    </form>
  </div>
);



export default ChatView;
