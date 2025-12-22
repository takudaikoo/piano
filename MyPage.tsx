import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { useAppData } from './AppDataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Notification, UserSettings, Product } from './types';

// Icons
const Icons = {
    Package: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    Bell: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    Settings: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
};

const MyPage = () => {
    const { user, signOut, loading: authLoading } = useAuth();
    const { notifications, error: appError } = useAppData();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'history' | 'notifications' | 'settings'>('history');
    const [orders, setOrders] = useState<any[]>([]);
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) navigate('/login');
    }, [authLoading, user, navigate]);

    // Fetch User Data
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Orders with Items
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select(`
                        id, total_amount, status, created_at,
                        order_items (
                            quantity, price_at_purchase,
                            product_id
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (ordersError) throw ordersError;

                // For simplicity, we just store the raw data, merging product info if possible
                // In a real app we might join with products, but here we have product_id.
                // We can use useAppData().products to lookup details if needed, but let's just show ID for now or lookup.
                setOrders(ordersData || []);

                // 2. Fetch User Settings
                const { data: settingsData, error: settingsError } = await supabase
                    .from('user_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 is "Row not found"
                    throw settingsError;
                }

                if (settingsData) {
                    setSettings(settingsData);
                } else {
                    // Initialize default settings if not exists
                    const newSettings = { user_id: user.id, email_notification: true, app_notification: true };
                    const { error: insertError } = await supabase.from('user_settings').insert([newSettings]);
                    if (!insertError) setSettings(newSettings);
                }

            } catch (err) {
                console.error('Error fetching mypage data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleSettingChange = async (key: 'email_notification' | 'app_notification', value: boolean) => {
        if (!settings || !user) return;

        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings); // Optimistic update

        const { error } = await supabase
            .from('user_settings')
            .update({ [key]: value, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

        if (error) {
            console.error('Error updating settings:', error);
            // Revert on error
            setSettings(settings);
            alert('設定の保存に失敗しました');
        }
    };

    if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-4 h-16 flex items-center justify-between shadow-sm">
                <Link to="/" className="text-stone-500 hover:text-brand-600 font-bold text-sm flex items-center gap-1">
                    ← サイトに戻る
                </Link>
                <h1 className="text-lg font-bold text-stone-800">マイページ</h1>
                <button onClick={() => signOut()} className="text-stone-400 hover:text-stone-600 p-2">
                    <Icons.LogOut />
                </button>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* User Profile Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 mb-8 flex items-center gap-4">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 text-2xl font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs text-stone-500 font-bold mb-1">ログイン中</p>
                        <p className="text-stone-800 font-bold truncate">{user.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-stone-200 p-1 rounded-lg mb-8">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white text-brand-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <Icons.Package /> 購入履歴
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'notifications' ? 'bg-white text-brand-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <Icons.Bell /> 通知
                        {notifications.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{notifications.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'settings' ? 'bg-white text-brand-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        <Icons.Settings /> 設定
                    </button>
                </div>

                {/* Content */}
                <div className="animate-fade-in">

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-dashed border-stone-200">
                                    購入履歴はありません
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-stone-100 p-4">
                                        <div className="flex justify-between items-start mb-3 border-b border-stone-100 pb-3">
                                            <div>
                                                <p className="text-xs text-stone-400 font-bold mb-1">注文日時: {new Date(order.created_at).toLocaleDateString()}</p>
                                                <p className="text-sm font-bold text-stone-800">合計: ¥{order.total_amount.toLocaleString()}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status === 'pending_payment' ? '未払い' : order.status === 'paid' ? '支払い済み' : order.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {order.order_items.map((item: any) => (
                                                <div key={item.product_id} className="flex justify-between items-center text-sm">
                                                    <span className="text-stone-600">商品ID: {item.product_id}</span>
                                                    <span className="text-stone-900">x{item.quantity}</span>
                                                </div>
                                            ))}
                                            {/* Note: Ideally we look up product title from products context using item.product_id */}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-4">
                            {notifications.length === 0 ? (
                                <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-dashed border-stone-200">
                                    お知らせはありません
                                </div>
                            ) : (
                                notifications.map(note => (
                                    <div key={note.id} className="bg-white rounded-xl shadow-sm border border-stone-100 p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${note.type === 'alert' ? 'bg-red-100 text-red-600' : note.type === 'new_arrival' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {note.type === 'new_arrival' ? '新着' : note.type === 'alert' ? '重要' : 'お知らせ'}
                                            </span>
                                            <span className="text-xs text-stone-400">{new Date(note.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-bold text-stone-800 mb-2">{note.title}</h3>
                                        <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && settings && (
                        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-stone-800">メール通知</p>
                                    <p className="text-xs text-stone-500">注文完了や新着情報のお知らせ</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.email_notification}
                                        onChange={(e) => handleSettingChange('email_notification', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                </label>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-stone-800">アプリ内通知</p>
                                    <p className="text-xs text-stone-500">マイページでの重要なお知らせ</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.app_notification}
                                        onChange={(e) => handleSettingChange('app_notification', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                </label>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MyPage;
