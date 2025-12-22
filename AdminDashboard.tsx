import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from './constants';
import { Product, CategoryId, Notification } from './types';
import { useAppData } from './AppDataContext';
import { useAuth } from './AuthContext';
import { INITIAL_PRODUCTS } from './seedData';

// Simple types for form state (partial product)
type ProductForm = Omit<Product, 'id' | 'isNew' | 'isPopular'>;
type NotificationForm = Omit<Notification, 'id' | 'created_at'>;

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { products, addProduct, updateProduct, deleteProduct, refreshProducts, addNotification } = useAppData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'products' | 'notifications'>('products');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
    if (!user) return null; // Prevent flash

    // Edit Mode State
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState: ProductForm = {
        title: '',
        catchCopy: '',
        price: 0,
        category: 'intro',
        image: '',
        images: [],
        specs: { format: 'PDF', size: 'A4', pages: 1 },
        targetAudience: [''],
        benefits: ['', '', ''],
        description: '',
        howTo: '',
    };

    const initialNotificationState: NotificationForm = {
        title: '',
        content: '',
        type: 'info'
    };

    const [formData, setFormData] = useState<ProductForm>(initialFormState);
    const [notifData, setNotifData] = useState<NotificationForm>(initialNotificationState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNotifChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNotifData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            specs: { ...prev.specs, [name]: name === 'pages' ? Number(value) : value }
        }));
    };

    const handleArrayChange = (index: number, value: string, field: 'targetAudience' | 'benefits') => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const addTarget = () => {
        setFormData(prev => ({ ...prev, targetAudience: [...prev.targetAudience, ''] }));
    };

    const removeTarget = (index: number) => {
        setFormData(prev => ({
            ...prev,
            targetAudience: prev.targetAudience.filter((_, i) => i !== index)
        }));
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData({
            title: product.title,
            catchCopy: product.catchCopy,
            price: product.price,
            category: product.category,
            image: product.image,
            images: product.images,
            specs: product.specs || { format: 'PDF', size: 'A4', pages: 1 },
            targetAudience: product.targetAudience.length > 0 ? product.targetAudience : [''],
            benefits: product.benefits.length > 0 ? product.benefits : ['', '', ''], // Ensure at least 3 slots or match array
            description: product.description,
            howTo: product.howTo,
        });
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.price) {
            alert('タイトルと価格は必須です');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                // Update existing
                await updateProduct(editingId, formData);
                alert('商品を更新しました！');
            } else {
                // Create new
                await addProduct({
                    ...formData,
                    isNew: true,
                    isPopular: false
                });
                alert('商品を登録しました！');
            }
            // Reset form
            setEditingId(null);
            setFormData(initialFormState);
        } catch (error) {
            console.error(error);
            alert('保存に失敗しました: ' + (error as any).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNotifSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notifData.title || !notifData.content) {
            alert('タイトルと本文は必須です');
            return;
        }

        if (!window.confirm('この内容でお知らせを配信しますか？（全ユーザーに表示されます）')) return;

        setIsSubmitting(true);
        try {
            await addNotification(notifData);
            alert('お知らせを配信しました！');
            setNotifData(initialNotificationState);
        } catch (error) {
            console.error(error);
            alert('配信に失敗しました: ' + (error as any).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSeed = async () => {
        if (!window.confirm('初期データ（7件）をデータベースに追加しますか？')) return;
        setIsSubmitting(true);
        try {
            let count = 0;
            for (const p of INITIAL_PRODUCTS) {
                const exists = products.some(existing => existing.title === p.title);
                if (!exists) {
                    const { id, ...rest } = p;
                    await addProduct(rest);
                    count++;
                }
            }
            alert(`${count}件のデータを追加しました！`);
        } catch (error) {
            console.error(error);
            alert('データの追加に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = (product: Product) => {
        setEditingId(null); // Ensure we are in create mode
        setFormData({
            title: product.title + ' (コピー)',
            catchCopy: product.catchCopy,
            price: product.price,
            category: product.category,
            image: product.image,
            images: [...product.images],
            specs: { ...product.specs },
            targetAudience: [...product.targetAudience],
            benefits: [...product.benefits],
            description: product.description,
            howTo: product.howTo,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert('内容をコピーしました。編集して「DBに保存する」を押してください。');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('本当に削除しますか？')) return;
        try {
            await deleteProduct(id);
            // If deleting the item currently being edited, cancel edit
            if (editingId === id) {
                handleCancelEdit();
            }
        } catch (error) {
            alert('削除に失敗しました');
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-stone-200 sticky top-0 z-30 px-4 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-stone-800">管理画面</h1>
                    <div className="flex bg-stone-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'products' ? 'bg-white shadow text-brand-600' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            教材管理
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'notifications' ? 'bg-white shadow text-brand-600' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            お知らせ配信
                        </button>
                    </div>
                </div>
                <button onClick={() => navigate('/')} className="text-stone-500 hover:text-brand-600 font-bold text-sm">
                    サイトに戻る
                </button>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* --- PRODUCTS TAB --- */}
                {activeTab === 'products' && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Col: Form */}
                        <div>
                            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center justify-between">
                                {editingId ? '教材の編集' : '新規登録'}
                                {editingId && (
                                    <button onClick={handleCancelEdit} className="text-xs bg-stone-200 text-stone-600 px-2 py-1 rounded hover:bg-stone-300">
                                        編集をキャンセル
                                    </button>
                                )}
                            </h2>
                            <form onSubmit={handleSubmit} className={`bg-white rounded-xl shadow-sm border p-6 space-y-6 ${editingId ? 'border-brand-500 ring-2 ring-brand-100' : 'border-stone-100'}`}>
                                {/* 1. Basic Info */}
                                <section className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-stone-600 mb-1">商品の項目の選択</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-stone-600 mb-1">金額 (円)</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                                className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-600 mb-1">商品名</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="例: 3歳からの「絶対音感」育成カード"
                                            className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-600 mb-1">補足文言 (キャッチコピー)</label>
                                        <input
                                            type="text"
                                            name="catchCopy"
                                            value={formData.catchCopy}
                                            onChange={handleChange}
                                            placeholder="例: 遊び感覚で耳が育つ！"
                                            className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-600 mb-1">商品画像URL</label>
                                        <input
                                            type="text"
                                            name="image"
                                            value={formData.image}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                            className="mb-2 w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                        />
                                    </div>
                                </section>

                                {/* 2. Specs */}
                                <section className="space-y-4">
                                    <h3 className="text-md font-bold text-stone-700 border-b border-stone-100 pb-1">仕様</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="text" name="format" value={formData.specs.format} onChange={handleSpecChange} placeholder="形式 (PDF)" className="rounded border-stone-200 text-sm" />
                                        <input type="text" name="size" value={formData.specs.size} onChange={handleSpecChange} placeholder="サイズ (A4)" className="rounded border-stone-200 text-sm" />
                                        <input type="number" name="pages" value={formData.specs.pages} onChange={handleSpecChange} placeholder="ページ数" className="rounded border-stone-200 text-sm" />
                                    </div>
                                </section>

                                {/* 3. Target Audience */}
                                <section className="space-y-4">
                                    <h3 className="text-md font-bold text-stone-700 border-b border-stone-100 pb-1">こんな生徒さんに効果的</h3>
                                    <div className="space-y-2">
                                        {formData.targetAudience.map((target, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={target}
                                                    onChange={(e) => handleArrayChange(index, e.target.value, 'targetAudience')}
                                                    placeholder={`例: 集中力が続かない子 (${index + 1})`}
                                                    className="flex-1 rounded-lg border-stone-200 text-sm focus:border-brand-500 focus:ring-brand-500"
                                                />
                                                <button type="button" onClick={() => removeTarget(index)} className="text-stone-400 hover:text-red-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addTarget} className="text-sm text-brand-600 font-bold hover:underline flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            追加する
                                        </button>
                                    </div>
                                </section>

                                {/* 4. Details & Benefits */}
                                <section className="space-y-4">
                                    <h3 className="text-md font-bold text-stone-700 border-b border-stone-100 pb-1">使用後の変化・詳細</h3>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-600 mb-1">説明文</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full rounded-lg border-stone-200 text-sm focus:border-brand-500 focus:ring-brand-500" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-600 mb-1">メリット (★3つまで)</label>
                                        <div className="space-y-2">
                                            {[0, 1, 2].map((i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="text-accent-yellow">★</span>
                                                    <input
                                                        type="text"
                                                        value={formData.benefits[i] || ''}
                                                        onChange={(e) => handleArrayChange(i, e.target.value, 'benefits')}
                                                        placeholder={`メリット ${i + 1}`}
                                                        className="flex-1 rounded-lg border-stone-200 text-sm focus:border-brand-500 focus:ring-brand-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-600 mb-1">使い方のヒント</label>
                                        <textarea name="howTo" value={formData.howTo} onChange={handleChange} rows={2} className="w-full rounded-lg border-stone-200 text-sm focus:border-brand-500 focus:ring-brand-500" />
                                    </div>
                                </section>

                                <div className="pt-4 border-t border-stone-100 flex gap-2">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-3 px-4 rounded-lg transition-all"
                                        >
                                            キャンセル
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? '保存中...' : (editingId ? '変更を保存する' : 'DBに保存する')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right Col: List */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-stone-800">登録済み教材一覧 ({products.length})</h2>
                                <div className="flex gap-2">
                                    <button onClick={handleSeed} disabled={isSubmitting} className="text-xs bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold px-3 py-1 rounded">
                                        {isSubmitting ? '追加中...' : '初期データ投入'}
                                    </button>
                                    <button onClick={refreshProducts} className="text-sm text-brand-600 hover:underline">更新</button>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                                {products.map(product => (
                                    <div
                                        key={product.id}
                                        className={`bg-white border rounded-lg p-3 flex gap-3 shadow-sm hover:shadow-md transition-all ${editingId === product.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200'}`}
                                    >
                                        <div className="w-16 h-16 bg-stone-100 rounded overflow-hidden flex-shrink-0">
                                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs text-brand-600 font-bold truncate">{CATEGORIES.find(c => c.id === product.category)?.label}</p>
                                                <span className="text-xs font-bold text-stone-400">¥{product.price}</span>
                                            </div>
                                            <h3 className="font-bold text-stone-800 text-sm truncate leading-tight mb-1">{product.title}</h3>
                                            <p className="text-xs text-stone-500 truncate">{product.catchCopy}</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-brand-400 hover:text-brand-600 p-1"
                                                title="編集"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => handleCopy(product)}
                                                className="text-brand-400 hover:text-brand-600 p-1"
                                                title="コピーして新規作成"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                                title="削除"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {products.length === 0 && (
                                    <div className="text-center py-8 text-stone-400 bg-stone-100 rounded-lg border-2 border-dashed border-stone-200">
                                        データがありません<br />
                                        <span className="text-xs">右上の「初期データ投入」で使用を開始できます</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- NOTIFICATIONS TAB --- */}
                {activeTab === 'notifications' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
                            <h2 className="text-xl font-bold text-stone-800 mb-6">お知らせ配信</h2>
                            <form onSubmit={handleNotifSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-stone-600 mb-2">通知タイプ</label>
                                    <div className="flex gap-4">
                                        {[
                                            { val: 'info', label: 'お知らせ (青)', bg: 'bg-blue-100', text: 'text-blue-600' },
                                            { val: 'new_arrival', label: '新着情報 (緑)', bg: 'bg-green-100', text: 'text-green-600' },
                                            { val: 'alert', label: '重要 (赤)', bg: 'bg-red-100', text: 'text-red-600' },
                                        ].map((t) => (
                                            <label key={t.val} className={`cursor-pointer border rounded-lg p-3 flex-1 text-center transition-all ${notifData.type === t.val ? 'border-brand-500 ring-2 ring-brand-100 bg-stone-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value={t.val}
                                                    checked={notifData.type === t.val}
                                                    onChange={handleNotifChange}
                                                    className="sr-only"
                                                />
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.bg} ${t.text}`}>{t.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-stone-600 mb-1">タイトル</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={notifData.title}
                                        onChange={handleNotifChange}
                                        placeholder="例: 年末年始の休業について"
                                        className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-stone-600 mb-1">本文</label>
                                    <textarea
                                        name="content"
                                        value={notifData.content}
                                        onChange={handleNotifChange}
                                        rows={6}
                                        placeholder="お知らせの詳細を入力してください..."
                                        className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                                    全ユーザーへ配信する
                                </button>
                                <p className="text-center text-xs text-stone-400 mt-2">※配信された通知は、すべてのユーザーのマイページに表示されます。</p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
