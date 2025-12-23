import React, { useState, useRef, useEffect } from 'react';
import { Prayer, PrayerCategory } from '../types';
import { supabase } from '../services/supabase';
import { CHAT_SYSTEM_PROMPT } from '../constants'; // Reusing if needed or just for consistency

interface PrayerEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (prayer: Omit<Prayer, 'id' | 'isFavorite'>) => void;
    initialDate: string;
    initialData?: Prayer | null;
}

const PrayerEditor: React.FC<PrayerEditorProps> = ({ isOpen, onClose, onSubmit, initialDate, initialData }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<PrayerCategory>(PrayerCategory.GRATIDAO);
    const [date, setDate] = useState(initialDate);
    const [images, setImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Voice State
    const recognitionRef = useRef<any>(null);
    const [isListening, setIsListening] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [voiceError, setVoiceError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setContent(initialData.content);
                setCategory(initialData.category);
                setDate(initialData.date.split('T')[0]);
                setImages(initialData.images || []);
            } else {
                setTitle('');
                setContent('');
                setCategory(PrayerCategory.GRATIDAO);
                setDate(initialDate);
                setImages([]);
            }
            setInterimText('');
            setVoiceError(null);
        }
    }, [isOpen, initialData, initialDate]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('prayer-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('prayer-images')
                .getPublicUrl(filePath);

            setImages(prev => [...prev, data.publicUrl]);
        } catch (error) {
            console.error('Error uploading image: ', error);
            alert('Erro ao fazer upload da imagem.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };


    // Voice Logic (Reused)
    const toggleDictation = () => {
        if (isListening) stopDictation();
        else startDictation();
    };

    const startDictation = () => {
        setVoiceError(null);
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceError("Navegador sem suporte a voz.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.lang = 'pt-BR';
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => { setIsListening(false); setInterimText(''); };
            recognition.onerror = (event: any) => {
                console.error("Speech error", event.error);
                setVoiceError("Erro no reconhecimento de voz.");
                setIsListening(false);
            };

            recognition.onresult = (event: any) => {
                let final = '';
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript;
                    else interim += event.results[i][0].transcript;
                }
                if (final) setContent(prev => prev + (prev ? ' ' : '') + final);
                setInterimText(interim);
            };

            recognition.start();
        } catch (err) {
            setVoiceError("Erro ao iniciar microfone.");
        }
    };

    const stopDictation = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return;
        const finalDate = new Date(date + 'T12:00:00').toISOString();
        onSubmit({
            title,
            content: content + (interimText ? ' ' + interimText : ''),
            category,
            date: finalDate,
            images
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-surface-border">
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-text-secondary dark:hover:text-white transition-colors">
                    Cancelar
                </button>
                <span className="font-bold text-slate-800 dark:text-white">
                    {initialData ? 'Editar' : 'Novo Diário'}
                </span>
                <button
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className="bg-primary text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                    {isUploading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto p-4 md:p-6">
                {/* Date & Category */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-surface-dark/50 border-none rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categoria</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value as PrayerCategory)}
                            className="w-full bg-slate-50 dark:bg-surface-dark/50 border-none rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-primary"
                        >
                            {Object.values(PrayerCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Título..."
                    className="w-full text-3xl font-bold bg-transparent border-none placeholder-slate-300 dark:placeholder-slate-700 text-slate-900 dark:text-white focus:ring-0 px-0 mb-4"
                />

                {/* Content */}
                <textarea
                    value={content + (interimText ? ' ' + interimText : '')}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Escreva seus pensamentos..."
                    className="w-full min-h-[200px] text-lg leading-relaxed bg-transparent border-none placeholder-slate-300 dark:placeholder-slate-700 text-slate-700 dark:text-slate-200 focus:ring-0 px-0 resize-none"
                />

                {/* Image Grid */}
                {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 animate-in fade-in slide-in-from-bottom-4">
                        {images.map((img, i) => (
                            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-surface-dark">
                                <img src={img} alt={`Anexo ${i}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Toolbar */}
            <div className="border-t border-slate-100 dark:border-surface-border p-3 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <label className="p-2 text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-white/10 rounded-full cursor-pointer transition-all">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <span className="material-symbols-outlined">image</span>
                    </label>

                    <button
                        onClick={toggleDictation}
                        className={`p-2 rounded-full transition-all ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' : 'text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-white/10'}`}
                    >
                        <span className="material-symbols-outlined">{isListening ? 'mic_off' : 'mic'}</span>
                    </button>

                    {voiceError && <span className="text-xs text-red-500">{voiceError}</span>}
                </div>
            </div>
        </div>
    );
};

export default PrayerEditor;
