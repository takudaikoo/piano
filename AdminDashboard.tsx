import React, { useState } from 'react';
import { CATEGORIES } from './constants';
import { Product, CategoryId } from './types';

// Simple types for form state (partial product)
type ProductForm = Omit<Product, 'id' | 'isNew' | 'isPopular'>;

interface AdminDashboardProps {
    onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const [formData, setFormData] = useState<ProductForm>({
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
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('--- Product Data Received ---');
        console.log(formData);
        alert('保存しました（詳細はコンソールを確認してください）');
    };

    return (
        <div className="min-h-screen bg-stone-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-stone-200 sticky top-0 z-30 px-4 h-16 flex items-center justify-between shadow-sm">
                <h1 className="text-xl font-bold text-stone-800">教材管理画面</h1>
                <button onClick={onBack} className="text-stone-500 hover:text-brand-600 font-bold text-sm">
                    サイトに戻る
                </button>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-stone-100 p-6 sm:p-8 space-y-8">

                    {/* 1. Basic Info */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">基本情報</h2>

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
                            {formData.image && (formData.image.startsWith('http://') || formData.image.startsWith('https://')) && (
                                <div className="w-32 h-24 bg-stone-100 rounded overflow-hidden border border-stone-200 relative">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('bg-stone-200');
                                            const errorMsg = document.createElement('div');
                                            errorMsg.className = 'absolute inset-0 flex items-center justify-center text-xs text-stone-500 font-bold p-2 text-center';
                                            errorMsg.textContent = '画像読み込みエラー';
                                            e.currentTarget.parentElement?.appendChild(errorMsg);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 2. Specs */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">仕様 (Specs)</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-stone-600 mb-1">形式</label>
                                <input
                                    type="text"
                                    name="format"
                                    value={formData.specs.format}
                                    onChange={handleSpecChange}
                                    placeholder="PDF"
                                    className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-600 mb-1">サイズ</label>
                                <input
                                    type="text"
                                    name="size"
                                    value={formData.specs.size}
                                    onChange={handleSpecChange}
                                    placeholder="A4"
                                    className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-600 mb-1">ページ数</label>
                                <input
                                    type="number"
                                    name="pages"
                                    value={formData.specs.pages}
                                    onChange={handleSpecChange}
                                    className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 3. Details (Target & Description) */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-2">詳細情報</h2>

                        {/* Target Audience */}
                        <div>
                            <label className="block text-sm font-bold text-stone-600 mb-2">TARGET (こんな生徒さんに効果的)</label>
                            <div className="space-y-2">
                                {formData.targetAudience.map((target, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={target}
                                            onChange={(e) => handleArrayChange(index, e.target.value, 'targetAudience')}
                                            placeholder={`ターゲット ${index + 1}`}
                                            className="flex-1 rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeTarget(index)}
                                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold"
                                            disabled={formData.targetAudience.length === 1}
                                        >
                                            削除
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addTarget}
                                    className="text-brand-600 text-sm font-bold hover:underline"
                                >
                                    + 追加する
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-stone-600 mb-1">使用後の変化 (商品説明)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                            />
                        </div>

                        {/* Benefits */}
                        <div>
                            <label className="block text-sm font-bold text-stone-600 mb-2">得られるメリット (最大3つ)</label>
                            <div className="space-y-3">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-accent-yellow font-bold">★</span>
                                        <input
                                            type="text"
                                            value={formData.benefits[i] || ''}
                                            onChange={(e) => handleArrayChange(i, e.target.value, 'benefits')}
                                            placeholder={`メリット ${i + 1}`}
                                            className="flex-1 rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* How To */}
                        <div>
                            <label className="block text-sm font-bold text-stone-600 mb-1">使い方のヒント</label>
                            <textarea
                                name="howTo"
                                value={formData.howTo}
                                onChange={handleChange}
                                rows={3}
                                placeholder="例: 厚紙に印刷してカード化し..."
                                className="w-full rounded-lg border-stone-200 focus:border-brand-500 focus:ring-brand-500"
                            />
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="pt-6 border-t border-stone-100 flex justify-end">
                        <button
                            type="submit"
                            className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform active:scale-95 transition-all"
                        >
                            保存する (Console Log)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
