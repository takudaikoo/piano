import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { supabase } from './supabaseClient';

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
        <div className="min-h-screen bg-stone-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-800 text-white p-4 text-center font-bold">
                    購入手続き (ステップ {step}/3)
                </div>

                <div className="p-6 sm:p-8">
                    {/* STEP 1: ToS */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-stone-800">利用規約の確認</h2>
                            <div className="h-64 overflow-y-auto bg-stone-50 p-4 rounded border border-stone-200 text-sm text-stone-600 leading-relaxed">
                                <p><strong>第1条（総則）</strong><br />本規約は...</p>
                                <p className="mt-2">（ここに長い利用規約が入ります。サンプルテキストです。）</p>
                                <p className="mt-2">商品購入にあたり、以下の事項に同意するものとします...</p>
                                <p className="mt-2">・個人情報の取り扱いについて...</p>
                                <p className="mt-2">・キャンセルポリシー...</p>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="tos"
                                    checked={agreedToToS}
                                    onChange={e => setAgreedToToS(e.target.checked)}
                                    className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                                />
                                <label htmlFor="tos" className="font-bold text-stone-800 cursor-pointer select-none">
                                    利用規約に同意する
                                </label>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!agreedToToS}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                次へ進む（配送先入力）
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Address */}
                    {step === 2 && (
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                            <h2 className="text-xl font-bold text-stone-800 mb-4">配送先・連絡先の入力</h2>
                            <p className="text-sm text-stone-500 mb-4">※入力内容は次回以降のために保存されます。</p>

                            <div>
                                <label className="block text-sm font-bold text-stone-600 mb-1">お名前 (フルネーム)</label>
                                <input required name="full_name" value={profile.full_name} onChange={handleProfileChange} className="w-full rounded border-stone-200" placeholder="例: 山田 太郎" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-stone-600 mb-1">郵便番号</label>
                                    <input required name="postal_code" value={profile.postal_code} onChange={handleProfileChange} className="w-full rounded border-stone-200" placeholder="例: 123-4567" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-600 mb-1">電話番号</label>
                                    <input required name="phone_number" value={profile.phone_number} onChange={handleProfileChange} className="w-full rounded border-stone-200" placeholder="例: 090-1234-5678" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-600 mb-1">都道府県</label>
                                <input required name="prefecture" value={profile.prefecture} onChange={handleProfileChange} className="w-full rounded border-stone-200" placeholder="例: 東京都" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-600 mb-1">市区町村・番地</label>
                                <input required name="address_line1" value={profile.address_line1} onChange={handleProfileChange} className="w-full rounded border-stone-200" placeholder="例: 渋谷区1-2-3" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-600 mb-1">建物名・部屋番号 (任意)</label>
                                <input name="address_line2" value={profile.address_line2} onChange={handleProfileChange} className="w-full rounded border-stone-200" placeholder="例: マンション 101号室" />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-stone-200 text-stone-700 font-bold py-3 rounded-lg">戻る</button>
                                <button type="submit" disabled={loading} className="flex-1 bg-brand-600 text-white font-bold py-3 rounded-lg shadow">
                                    {loading ? '保存中...' : '次へ進む（確認）'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: Confirm */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-stone-800">注文内容の最終確認</h2>

                            <div className="bg-stone-50 p-4 rounded-lg space-y-2 text-sm border border-stone-100">
                                <h3 className="font-bold text-stone-700 border-b border-stone-200 pb-1 mb-2">配送先</h3>
                                <p>〒{profile.postal_code} {profile.prefecture} {profile.city}</p>
                                <p>{profile.address_line1} {profile.address_line2}</p>
                                <p>{profile.full_name} 様 / {profile.phone_number}</p>
                            </div>

                            <div className="bg-stone-50 p-4 rounded-lg space-y-2 text-sm border border-stone-100">
                                <h3 className="font-bold text-stone-700 border-b border-stone-200 pb-1 mb-2">注文商品</h3>
                                {items.map(item => (
                                    <div key={item.product.id} className="flex justify-between">
                                        <span>{item.product.title} x {item.quantity}</span>
                                        <span>¥{(item.product.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="border-t border-stone-300 pt-2 flex justify-between font-bold text-lg text-brand-600">
                                    <span>合計</span>
                                    <span>¥{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setStep(2)} className="flex-1 bg-stone-200 text-stone-700 font-bold py-3 rounded-lg">戻る</button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex-[2] bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg shadow-lg text-lg"
                                >
                                    {loading ? '注文処理中...' : '注文を確定する'}
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
