import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface LoginViewProps {
    onLogin: (email: string) => void;
    onNavigateToRegister: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert('Erro ao entrar: ' + error.message);
                return;
            }

            if (data.user) {
                onLogin(email); // Autentica o usuário no App
            }
        } catch (err) {
            console.error(err);
            alert('Erro inesperado ao entrar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-surface-border animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-4 p-3 animate-bounce-slow">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Bem-vindo de volta</h1>
                    <p className="text-slate-500 dark:text-text-secondary">Faça login para continuar sua jornada espiritual.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined">mail</span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Senha</label>
                            <button
                                type="button"
                                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                onClick={() => alert("Funcionalidade de recuperação de senha será implementada em breve.")}
                            >
                                Esqueceu a senha?
                            </button>
                        </div>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined">lock</span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span>Entrando...</span>
                            </>
                        ) : (
                            <span>Entrar</span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 dark:text-text-secondary text-sm">
                        Não tem uma conta?{' '}
                        <button
                            onClick={onNavigateToRegister}
                            className="font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                            Criar conta
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
