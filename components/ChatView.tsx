import React, { useState, useRef, useEffect } from 'react';
import { getChatModel } from '../services/geminiService';
import { CHAT_SYSTEM_PROMPT } from '../constants';
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

      const systemPrompt = CHAT_SYSTEM_PROMPT
        .replace('{{userName}}', userName)
        .replace('{{CONTEXT}}', prayersSummary);

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
    <div className="flex flex-col md:flex-row h-full relative">

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white dark:bg-surface-dark rounded-full shadow-md text-slate-600 dark:text-slate-300"
      >
        <span className="material-symbols-outlined">{isSidebarOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Sidebar - History */}
      <aside className={`
        fixed md:relative z-40 inset-y-0 left-0 w-72 bg-white dark:bg-black border-r border-slate-100 dark:border-white/5
        transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition-all font-medium text-sm"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="font-medium">Nova conversa</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-1">
          <h3 className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Recentes</h3>
          {sessions.map(session => (
            <div key={session.id} className="group relative">
              <button
                onClick={() => { setCurrentSessionId(session.id); setIsSidebarOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm truncate transition-colors ${currentSessionId === session.id ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                {session.title}
              </button>
              {currentSessionId === session.id && (
                <button
                  onClick={(e) => deleteSession(e, session.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white dark:bg-background-dark">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-0 scroll-smooth" ref={scrollRef}>
          <div className="max-w-3xl mx-auto flex flex-col min-h-full p-4 md:p-8">
            {!currentSessionId && messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                <h1 className="text-4xl md:text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2 tracking-tight">
                  Olá, {userName.split(' ')[0]}
                </h1>
                <h2 className="text-xl md:text-2xl text-slate-300 dark:text-slate-600 font-light mb-12">
                  Como posso ajudar?
                </h2>
              </div>
            ) : (
              <div className="w-full space-y-6 pb-24">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-4 w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'model' && (
                      <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 mt-1">
                        <span className="material-symbols-outlined text-sm text-blue-500">sparkle</span>
                      </div>
                    )}

                    <div className={`flex flex-col max-w-[85%] md:max-w-[75%] space-y-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-5 py-3.5 text-[15px] leading-relaxed ${m.role === 'user' ? 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-100 rounded-3xl rounded-tr-sm' : 'text-slate-700 dark:text-slate-200'}`}>
                        <ReactMarkdown
                          components={{
                            strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                          }}
                        >
                          {m.text}
                        </ReactMarkdown>
                      </div>
                      <div className="text-[10px] text-slate-300 dark:text-slate-600 font-medium px-2">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Helper spacer for user to keep alignment if needed, though justify-end handles it */}
                    {m.role === 'user' && <div className="w-0" />}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 w-full justify-start">
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 animate-pulse">
                      <span className="material-symbols-outlined text-sm text-blue-500">sparkle</span>
                    </div>
                    <div className="flex items-center gap-1 h-8">
                      <div className="size-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce delay-0"></div>
                      <div className="size-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce delay-150"></div>
                      <div className="size-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="p-4 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-white/5">
          <div className="max-w-3xl mx-auto w-full">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center bg-slate-100 dark:bg-surface-dark/50 rounded-full border border-transparent focus-within:border-slate-300 dark:focus-within:border-white/20 focus-within:bg-white dark:focus-within:bg-black/40 transition-all overflow-hidden"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white px-6 py-3.5 placeholder-slate-400 dark:placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 mr-2 bg-transparent text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
              >
                {input.trim() ? (
                  <span className="material-symbols-outlined filled">arrow_upward</span>
                ) : (
                  <span className="material-symbols-outlined">mic</span>
                )}
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 mt-2">
              A IA pode cometer erros.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatView;
