import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setLoginStatus('idle');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            // Success Animation
            setLoginStatus('success');
            setTimeout(() => {
                navigate('/');
            }, 1500); // Wait for animation
        } catch (err: any) {
            // Error Animation
            setLoginStatus('error');
            setError(err.message);
            setLoading(false);
            // Shake effect timeout
            setTimeout(() => setLoginStatus('idle'), 1000);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-100 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-yellow/30 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 relative z-10 border border-white/50">
                <h2 className="text-3xl font-bold text-stone-800 mb-8 text-center tracking-tight">
                    おかえりなさい
                    <span className="block text-sm font-normal text-stone-500 mt-2">Pianao教室 教材サイト</span>
                </h2>

                {/* Failure Animation (Rests) */}
                {loginStatus === 'error' && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-50">
                        <div className="flex gap-4 animate-shake text-4xl text-stone-400">
                            <span>𝄽</span>
                            <span>𝄽</span>
                            <span>𝄽</span>
                        </div>
                    </div>
                )}

                {/* Success Animation (Notes) */}
                {loginStatus === 'success' && (
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-brand-500 text-2xl animate-note-pop"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    '--angle': `${i * 30}deg`,
                                    '--distance': '150px',
                                    '--delay': `${Math.random() * 0.2}s`,
                                    animationDelay: 'var(--delay)'
                                } as React.CSSProperties}
                            >
                                {['♪', '♫', '♬'][i % 3]}
                            </div>
                        ))}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className={`bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 ${loginStatus === 'error' ? 'animate-shake' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="group">
                        <label className="block text-xs font-bold text-stone-500 mb-1 ml-1 group-focus-within:text-brand-500 transition-colors">メールアドレス</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="example@email.com"
                                className="w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-brand-500 rounded-xl px-4 py-3 outline-none transition-all duration-300 font-medium text-stone-700 placeholder:text-stone-300 shadow-inner"
                            />
                            <div className="absolute right-3 top-3 text-stone-300 hover:text-stone-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold text-stone-500 mb-1 ml-1 group-focus-within:text-brand-500 transition-colors">パスワード</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-brand-500 rounded-xl px-4 py-3 outline-none transition-all duration-300 font-medium text-stone-700 placeholder:text-stone-300 shadow-inner"
                            />
                            <div className="absolute right-3 top-3 text-stone-300 hover:text-stone-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || loginStatus === 'success'}
                        className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg transform active:scale-95 flex items-center justify-center gap-2
                            ${loginStatus === 'success'
                                ? 'bg-green-500 text-white shadow-green-200 scale-95'
                                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-200'
                            }
                            disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                        {loginStatus === 'success' ? (
                            <>
                                <span className="animate-bounce">♪</span> ログイン成功！
                            </>
                        ) : loading ? (
                            'ログイン中...'
                        ) : (
                            'ログイン'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                    <p className="text-sm text-stone-500 mb-2">アカウントをお持ちでない方</p>
                    <Link to="/signup" className="inline-block text-brand-600 font-bold hover:text-brand-700 hover:underline transition-all">
                        新規登録はこちら
                    </Link>
                </div>
                <div className="mt-4 text-center">
                    <Link to="/" className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                        ← ホームに戻る
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
                
                @keyframes note-pop {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(
                            calc(-50% + cos(var(--angle)) * var(--distance)), 
                            calc(-50% + sin(var(--angle)) * var(--distance))
                        ) scale(1.5) rotate(20deg);
                        opacity: 0;
                    }
                }
                .animate-note-pop {
                    position: absolute;
                    animation: note-pop 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;
