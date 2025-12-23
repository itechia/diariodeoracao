
import React, { useState } from 'react';
import { PrayerCategory, Prayer } from '../types';


interface PrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prayer: Omit<Prayer, 'id' | 'isFavorite'>) => void;
  initialDate: string;
  initialData?: Prayer | null;
}

const PrayerModal: React.FC<PrayerModalProps> = ({ isOpen, onClose, onSubmit, initialDate, initialData }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PrayerCategory>(PrayerCategory.GRATIDAO);
  const [date, setDate] = useState(initialDate);


  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
        setCategory(initialData.category);
        setDate(initialData.date.split('T')[0]);
      } else {
        setTitle('');
        setContent('');
        setCategory(PrayerCategory.GRATIDAO);
        setDate(initialDate);
      }
    }
  }, [isOpen, initialData, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    onSubmit({ title, content, category, date: new Date(date + 'T12:00:00').toISOString() });

    // Close handled by parent, but good to reset? Parent usually closes.
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const recognitionRef = React.useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleDictation = () => {
    if (isListening) {
      stopDictation();
    } else {
      startDictation();
    }
  };

  const startDictation = () => {
    setErrorMsg(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg("Seu navegador não suporta ditado por voz. Tente usar o Google Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setContent(prev => prev + (prev ? ' ' : '') + final);
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permissão de microfone negada. Verifique as configurações.');
        } else {
          setErrorMsg('Erro no reconhecimento de voz.');
        }
        setIsListening(false);
        setInterimText('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognition.start();
    } catch (error) {
      console.error("Erro ao iniciar ditado:", error);
      setErrorMsg("Erro ao iniciar o microfone.");
    }
  };

  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText('');
    }
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-border w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{initialData ? 'Editar Oração' : 'Nova Oração'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-text-secondary dark:hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 dark:text-text-secondary mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
              placeholder="ex: Saúde da família"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 dark:text-text-secondary mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PrayerCategory)}
                className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
              >
                {Object.values(PrayerCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 dark:text-text-secondary mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-slate-500 dark:text-text-secondary">Sua Oração</label>
              <button
                type="button"
                onClick={toggleDictation}
                className={`text-xs flex items-center gap-1 transition-all ${isListening ? 'text-red-500 font-bold animate-pulse' : 'text-slate-500 hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[16px]">{isListening ? 'mic_off' : 'mic'}</span>
                {isListening ? 'Ouvindo...' : 'Ditar Oração'}
              </button>
            </div>
            {errorMsg && (
              <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded border border-red-100 dark:border-red-900/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {errorMsg}
              </div>
            )}
            <textarea
              value={content + (interimText ? ' ' + interimText : '')}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-surface-border rounded-lg text-slate-900 dark:text-white focus:ring-primary focus:border-primary resize-none"
              placeholder="Escreva sua conversa com Deus..."
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg mt-2"
          >
            {initialData ? 'Salvar Alterações' : 'Salvar Oração'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrayerModal;
