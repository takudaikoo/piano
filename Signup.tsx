import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const Icons = {
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
    Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>,
};

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fireSuccess = () => {
        const scalar = 3;
        // @ts-ignore
        const eighthNote = confetti.shapeFromText({ text: '♪', scalar });
        // @ts-ignore
        const beamNote = confetti.shapeFromText({ text: '♫', scalar });

        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 20 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                shapes: [eighthNote, beamNote],
                colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#ea580c'],
                scalar
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                shapes: [eighthNote, beamNote],
                colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#ea580c'],
                scalar
            });
        }, 250);
    };

    const fireError = () => {
        const scalar = 4;
        // @ts-ignore
        const rest = confetti.shapeFromText({ text: '𝄇', scalar });

        confetti({
            particleCount: 15,
            spread: 40,
            origin: { y: 0.3 }, // Drop from a bit higher in this centered form
            shapes: [rest],
            colors: ['#7c2d12'],
            gravity: 0.8,
            scalar,
            startVelocity: 15,
            ticks: 100,
            zIndex: 100
        });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;

            fireSuccess();
            // Wait slightly for animation before alert
            await new Promise(resolve => setTimeout(resolve, 800));
            alert('登録確認メールを送信しました。メールを確認してリンクをクリックしてください。');
            navigate('/login');
        } catch (err: any) {
            fireError();
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute top-1/2 -left-32 w-64 h-64 bg-accent-yellow/20 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8 sm:p-10 relative z-10 animate-fade-in">
                {/* Header */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
                        <span className="text-xl font-bold text-brand-900 tracking-tight">
                            Pianao教室<span className="text-brand-500 ml-1">教材サイト</span>
                        </span>
                    </Link>
                    <h2 className="text-2xl font-bold text-stone-800">新規会員登録</h2>
                    <p className="text-stone-500 text-sm mt-2">アカウントを作成して教材を利用しましょう</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-shake">
                        <span className="text-lg">⚠</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">メールアドレス</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                                <Icons.Mail />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="example@email.com"
                                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-stone-800 placeholder-stone-400 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">パスワード</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                                <Icons.Lock />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-stone-800 placeholder-stone-400 font-medium"
                            />
                        </div>
                        <p className="text-xs text-stone-400 ml-1 flex items-center gap-1">
                            <Icons.Check /> 6文字以上の半角英数字
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                登録する
                                <span className="group-hover:translate-x-1 transition-transform">
                                    <Icons.ArrowRight />
                                </span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-stone-100">
                    <p className="text-center text-sm text-stone-500 mb-6">
                        すでにアカウントをお持ちの方は
                    </p>
                    <Link
                        to="/login"
                        className="block w-full py-3.5 text-center text-stone-600 font-bold bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all"
                    >
                        ログインはこちら
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-6 text-center w-full text-xs text-stone-400">
                &copy; 2024 Pianao教室 All Rights Reserved.
            </div>
        </div>
    );
};

export default Signup;
