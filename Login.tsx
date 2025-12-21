import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">ログイン</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-stone-600 mb-1">メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-stone-600 mb-1">パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-stone-500">
                    アカウントをお持ちでないですか？{' '}
                    <Link to="/signup" className="text-brand-600 font-bold hover:underline">
                        新規登録
                    </Link>
                </div>
                <div className="mt-4 text-center">
                    <Link to="/" className="text-xs text-stone-400 hover:text-stone-600">
                        ホームに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
