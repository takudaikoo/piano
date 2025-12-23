import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { supabase } from './supabaseClient';

const Icons = {
    User: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
    Phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    Hash: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="9" y2="9" /><line x1="4" x2="20" y1="15" y2="15" /><line x1="10" x2="8" y1="3" y2="21" /><line x1="16" x2="14" y1="3" y2="21" /></svg>,
    Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>,
    ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>,
    ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>,
};

const Checkout = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { items, totalPrice, clearCart } = useCart();

    const [step, setStep] = useState(1); // 1: ToS, 2: Address, 3: Confirm
    const [agreedToToS, setAgreedToToS] = useState(false);
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        full_name: '',
        postal_code: '',
        prefecture: '',
        city: '',
        address_line1: '',
        address_line2: '',
        phone_number: '',
    });

    useEffect(() => {
        if (!authLoading && !user) navigate('/login');
        if (!authLoading && user) {
            // Fetch profile
            const fetchProfile = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile({
                        full_name: data.full_name || '',
                        postal_code: data.postal_code || '',
                        prefecture: data.prefecture || '',
                        city: data.city || '',
                        address_line1: data.address_line1 || '',
                        address_line2: data.address_line2 || '',
                        phone_number: data.phone_number || '',
                    });
                }
            };
            fetchProfile();
        }
    }, [user, authLoading, navigate]);

    if (authLoading) return <div className="p-10 text-center">読み込み中...</div>;
    if (!user) return null;

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Save Profile
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                ...profile,
                updated_at: new Date()
            });
            if (error) throw error;
            setStep(3); // Go to Confirm
        } catch (err: any) {
            alert('保存エラー: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: totalPrice,
                    status: 'pending_payment'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.product.id,
                quantity: item.quantity,
                price_at_purchase: item.product.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Clear Cart
            clearCart();

            // 4. Send Email Notification (Async, don't block success if it fails, but good to try)
            try {
                await supabase.functions.invoke('send-order-email', {
                    body: {
                        email: user.email,
                        name: profile.full_name,
                        items: items.map(i => ({
                            title: i.product.title,
                            quantity: i.quantity,
                            price: i.product.price
                        })),
                        total: totalPrice
                    }
                });
            } catch (emailErr) {
                console.error('Failed to send email:', emailErr);
                // Continue to success page even if email fails
            }

            // 5. Navigate to Success
            navigate('/order-success');

        } catch (err: any) {
            console.error(err);
            alert('注文処理中にエラーが発生しました: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 py-12 px-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 -right-20 w-96 h-96 bg-brand-100/50 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 -left-20 w-80 h-80 bg-accent-yellow/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden relative z-10 animate-fade-in">
                {/* Stepper Header */}
                <div className="bg-stone-800/5 p-4 border-b border-stone-100 flex justify-center items-center gap-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-stone-200 text-stone-500'}`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`w-12 h-0.5 rounded-full ${step > s ? 'bg-brand-500' : 'bg-stone-200'}`}></div>}
                        </div>
                    ))}
                </div>

                <div className="p-4 text-center border-b border-stone-100 bg-white/50">
                    <h2 className="text-lg font-bold text-stone-700">
                        {step === 1 && '利用規約の確認'}
                        {step === 2 && '配送先・連絡先の入力'}
                        {step === 3 && '注文内容の最終確認'}
                    </h2>
                </div>

                <div className="p-6 sm:p-10">
                    {/* STEP 1: ToS */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="h-64 overflow-y-auto bg-white p-6 rounded-xl border border-stone-200 text-sm text-stone-600 leading-relaxed shadow-inner">
                                <p><strong className="text-brand-700 text-base">第1条（総則）</strong><br />本規約は...</p>
                                <p className="mt-2">（ここに長い利用規約が入ります。サンプルテキストです。）</p>
                                <p className="mt-2 text-xs text-stone-400">--------------------------------------------------</p>
                                <p className="mt-2">商品購入にあたり、以下の事項に同意するものとします...</p>
                                <p className="mt-2">・個人情報の取り扱いについて...</p>
                                <p className="mt-2">・キャンセルポリシー...</p>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-brand-50/50 rounded-xl border border-brand-100 hover:bg-brand-50 transition-colors cursor-pointer" onClick={() => setAgreedToToS(!agreedToToS)}>
                                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${agreedToToS ? 'bg-brand-500 border-brand-500' : 'bg-white border-stone-300'}`}>
                                    {agreedToToS && <Icons.Check />}
                                </div>
                                {/* text-brand-50 is just for bg usage above. text should be stone */}
                                <label className="font-bold text-stone-700 cursor-pointer select-none flex-1">
                                    利用規約に同意する
                                </label>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!agreedToToS}
                                className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2"
                            >
                                次へ進む（配送先入力） <Icons.ArrowRight />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Address */}
                    {step === 2 && (
                        <form onSubmit={handleAddressSubmit} className="space-y-6 animate-fade-in">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">お名前 (フルネーム)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                                        <Icons.User />
                                    </div>
                                    <input
                                        required
                                        name="full_name"
                                        value={profile.full_name}
                                        onChange={handleProfileChange}
                                        placeholder="例: 山田 太郎"
                                        className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-stone-800 placeholder-stone-400 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Postal Code */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">郵便番号</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                                            <Icons.Hash />
                                        </div>
                                        <input
                                            required
                                            name="postal_code"
                                            value={profile.postal_code}
                                            onChange={handleProfileChange}
                                            placeholder="例: 123-4567"
                                            className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-stone-800 placeholder-stone-400 font-medium"
                                        />
                                    </div>
                                </div>
                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">電話番号</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-brand-500 transition-colors">
                                            <Icons.Phone />
                                        </div>
                                        <input
                                            required
                                            name="phone_number"
                                            value={profile.phone_number}
                                            onChange={handleProfileChange}
                                            placeholder="例: 090-1234-5678"
                                            className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-stone-800 placeholder-stone-400 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 space-y-4">
                                <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
                                    <Icons.MapPin /> 住所情報
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">都道府県</label>
                                        <input
                                            required
                                            name="prefecture"
                                            value={profile.prefecture}
                                            onChange={handleProfileChange}
                                            placeholder="例: 東京都"
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">市区町村・番地</label>
                                        <input
                                            required
                                            name="address_line1"
                                            value={profile.address_line1}
                                            onChange={handleProfileChange}
                                            placeholder="例: 渋谷区1-2-3"
                                            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">建物名・部屋番号 (任意)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                                                <Icons.Building />
                                            </div>
                                            <input
                                                name="address_line2"
                                                value={profile.address_line2}
                                                onChange={handleProfileChange}
                                                placeholder="例: マンション 101号室"
                                                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-white border border-stone-200 text-stone-600 font-bold py-3.5 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                                >
                                    <Icons.ArrowLeft /> 戻る
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? '保存中...' : '次へ進む（確認）'} <Icons.ArrowRight />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: Confirm */}
                    {step === 3 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex flex-col gap-4">
                                <div>
                                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Icons.MapPin /> 配送先情報
                                    </h3>
                                    <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                                        <p className="font-bold text-lg text-stone-800 mb-1">
                                            {profile.full_name} <span className="text-sm font-normal text-stone-500">様</span>
                                        </p>
                                        <p className="text-stone-600">〒{profile.postal_code}</p>
                                        <p className="text-stone-600">{profile.prefecture} {profile.city} {profile.address_line1}</p>
                                        {profile.address_line2 && <p className="text-stone-600">{profile.address_line2}</p>}
                                        <p className="text-stone-500 text-sm mt-2 flex items-center gap-1"><Icons.Phone /> {profile.phone_number}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">注文商品</h3>
                                    <div className="bg-white rounded-xl border border-stone-200 shadow-sm divide-y divide-stone-100">
                                        {items.map(item => (
                                            <div key={item.product.id} className="p-4 flex justify-between items-center hover:bg-stone-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    {item.product.image && <img src={item.product.image} className="w-12 h-12 object-cover rounded-md" alt="" />}
                                                    <div>
                                                        <div className="font-bold text-stone-800">{item.product.title}</div>
                                                        <div className="text-xs text-stone-500">数量: {item.quantity}</div>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-stone-700">¥{(item.product.price * item.quantity).toLocaleString()}</div>
                                            </div>
                                        ))}
                                        <div className="p-4 bg-brand-50/30 flex justify-between items-center">
                                            <span className="font-bold text-stone-600">合計金額</span>
                                            <span className="text-2xl font-bold text-brand-600">¥{totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 bg-white border border-stone-200 text-stone-600 font-bold py-4 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
                                >
                                    <Icons.ArrowLeft /> 戻る
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex-[2] bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 text-lg"
                                >
                                    {loading ? '注文処理中...' : '注文を確定する'} <Icons.Check />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
