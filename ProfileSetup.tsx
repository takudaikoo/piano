import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProfileSetup: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!nickname.trim()) {
            setError('ニックネームを入力してください');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Upsert profile with nickname
            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    nickname: nickname,
                    updated_at: new Date().toISOString(),
                });

            if (upsertError) throw upsertError;

            // Redirect to home
            navigate('/');
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">プロフィールの設定</h2>
                <p className="text-stone-500 text-sm text-center mb-8">
                    サイトで使用するニックネームを教えてください。<br />
                    （後から変更可能です）
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-stone-600 mb-1">ニックネーム</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="例: ピアノ太郎"
                            required
                            className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500 py-3 px-4 shadow-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? '設定を保存して始める' : '始める'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
