import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from './types';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { useAppData } from './AppDataContext';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    addToCart: (product: Product) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
    toggleCart: () => void;
    totalPrice: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { products } = useAppData(); // We need products to map product_id back to full product object
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem('pianp-cart');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    const [isOpen, setIsOpen] = useState(false);

    // Sync with DB when user logs in
    useEffect(() => {
        let mounted = true;

        const syncCart = async () => {
            if (!user) {
                // If not user, just rely on local state (initialized from localStorage)
                return;
            }

            try {
                // 1. Fetch DB Cart
                const { data: dbItems, error } = await supabase
                    .from('cart_items')
                    .select('*');

                if (error) {
                    console.error('Error fetching cart:', error);
                    return;
                }

                // 2. If DB is empty but we have local items, migrate them
                // (Only do this if we haven't synced yet? Simple check: if dbItems empty and localItems > 0)
                // This is a naive merge: we just push local items to DB if DB is empty.
                const localItems = JSON.parse(localStorage.getItem('pianp-cart') || '[]');
                if (dbItems.length === 0 && localItems.length > 0) {
                    for (const item of localItems) {
                        await supabase.from('cart_items').upsert({
                            user_id: user.id,
                            product_id: item.product.id,
                            quantity: item.quantity
                        });
                    }
                    // Refetch
                    const { data: refetched } = await supabase.from('cart_items').select('*');
                    if (refetched && mounted) {
                        mapAndSetItems(refetched);
                    }
                } else if (mounted) {
                    // Just set what's in DB
                    mapAndSetItems(dbItems);
                }

                // Clear local storage to avoid confusion? Or keep as backup?
                // Ideally clear it so we know we are in "Cloud Mode".
                localStorage.removeItem('pianp-cart');

            } catch (err) {
                console.error(err);
            }
        };

        const mapAndSetItems = (dbRows: any[]) => {
            if (!products.length) return; // Wait for products to load?

            // Map db rows (product_id, quantity) to CartItem (Product, quantity)
            const mapped: CartItem[] = dbRows.map(row => {
                const product = products.find(p => p.id === row.product_id);
                if (!product) return null;
                return {
                    product,
                    quantity: row.quantity
                };
            }).filter((i): i is CartItem => i !== null);

            setItems(mapped);
        };

        syncCart();

    }, [user, products]); // Re-run if user changes or products load

    // Persist to LocalStorage if Guest
    useEffect(() => {
        if (!user) {
            localStorage.setItem('pianp-cart', JSON.stringify(items));
        }
    }, [items, user]);


    const addToCart = async (product: Product) => {
        // Optimistic Update
        const newItems = [...items];
        const existingIdx = newItems.findIndex(i => i.product.id === product.id);
        if (existingIdx >= 0) {
            newItems[existingIdx].quantity += 1;
        } else {
            newItems.push({ product, quantity: 1 });
        }
        setItems(newItems);
        setIsOpen(true);

        if (user) {
            const qty = existingIdx >= 0 ? newItems[existingIdx].quantity : 1;
            await supabase.from('cart_items').upsert({
                user_id: user.id,
                product_id: product.id,
                quantity: qty
            });
        }
    };

    const removeFromCart = async (productId: string) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
        if (user) {
            await supabase.from('cart_items').delete().match({ user_id: user.id, product_id: productId });
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.product.id === productId
                ? { ...item, quantity }
                : item
        ));

        if (user) {
            await supabase.from('cart_items').upsert({
                user_id: user.id,
                product_id: productId,
                quantity: quantity
            });
        }
    };

    const clearCart = () => {
        setItems([]);
        if (user) {
            // Need a way to delete all? Or iterate.
            // supabase.from('cart_items').delete().eq('user_id', user.id); 
            // Note: .delete() without filters deletes all? No, requires filter.
            // Be careful.
            supabase.from('cart_items').delete().eq('user_id', user.id).then();
        } else {
            localStorage.removeItem('pianp-cart');
        }
    };

    const toggleCart = () => {
        setIsOpen(prev => !prev);
    };

    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            isOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            toggleCart,
            totalPrice,
            totalItems
        }}>
            {children}
        </CartContext.Provider>
    );
};

