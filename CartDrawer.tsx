import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

const CartDrawer: React.FC = () => {
    const navigate = useNavigate();
    const { items, isOpen, toggleCart, removeFromCart, updateQuantity, totalPrice } = useCart();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={toggleCart}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                        買い物かご
                    </h2>
                    <button onClick={toggleCart} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400">
                            <div className="mb-4 text-4xl">🛒</div>
                            <p>カートは空です</p>
                            <button onClick={toggleCart} className="mt-4 text-brand-600 font-bold hover:underline">
                                お買い物を続ける
                            </button>
                        </div>
                    ) : (
                        items.map(({ product, quantity }) => (
                            <div key={product.id} className="flex gap-4 bg-stone-50 p-3 rounded-lg border border-stone-100">
                                <div className="w-16 h-16 bg-white rounded overflow-hidden flex-shrink-0 border border-stone-200">
                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-stone-800 text-sm truncate">{product.title}</h3>
                                    <p className="text-brand-600 font-bold text-sm">¥{product.price.toLocaleString()}</p>

                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded">
                                            <button
                                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 text-stone-500"
                                            >
                                                -
                                            </button>
                                            <span className="text-xs font-bold w-6 text-center">{quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 text-stone-500"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(product.id)}
                                            className="text-xs text-stone-400 underline hover:text-red-500 ml-auto"
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 border-t border-stone-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-stone-500 font-bold">合計 ({items.length}点)</span>
                            <span className="text-2xl font-bold text-stone-900">¥{totalPrice.toLocaleString()}</span>
                        </div>
                        <button
                            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg transform active:scale-95 transition-all mb-2"
                            onClick={() => {
                                toggleCart();
                                navigate('/checkout');
                            }}
                        >
                            購入手続きへ
                        </button>
                        <p className="text-center text-[10px] text-stone-400">
                            ※デモサイトのため実際の決済は行われません
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
