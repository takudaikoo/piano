import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { Product, Notification } from './types';

interface AppDataContextType {
    products: Product[];
    notifications: Notification[];
    isLoading: boolean;
    error: string | null;
    refreshProducts: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setNotifications(data as Notification[]);
        } catch (err: any) {
            console.error('Error fetching notifications:', err);
            // Don't rethrow, to prevent blocking products
        }
    };

    const fetchProducts = async () => {
        console.log('fetchProducts started');
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching notifications...');
            await fetchNotifications(); // Fetch notifications too
            console.log('Fetching products...');
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mappedData: Product[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    catchCopy: item.catch_copy,
                    price: item.price,
                    category: item.category,
                    image: item.image,
                    images: item.images || [],
                    specs: item.specs || {},
                    targetAudience: item.target_audience || [],
                    benefits: item.benefits || [],
                    description: item.description,
                    howTo: item.how_to,
                    isNew: item.is_new,
                    isPopular: item.is_popular
                }));
                setProducts(mappedData);
            }
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(err.message);
        } finally {
            console.log('fetchProducts finished');
            setIsLoading(false);
        }
    };

    const addNotification = async (notification: Omit<Notification, 'id' | 'created_at'>) => {
        try {
            const { error } = await supabase.from('notifications').insert([notification]);
            if (error) throw error;
            await fetchNotifications();
        } catch (err: any) {
            console.error('Error adding notification:', err);
            throw err;
        }
    };

    // ... existing addProduct, updateProduct, deleteProduct ...

    const addProduct = async (product: Omit<Product, 'id'>) => {
        try {
            // Convert to snake_case for DB
            const dbPayload = {
                title: product.title,
                catch_copy: product.catchCopy,
                price: product.price,
                category: product.category,
                image: product.image,
                images: product.images,
                specs: product.specs,
                target_audience: product.targetAudience,
                benefits: product.benefits,
                description: product.description,
                how_to: product.howTo,
                is_new: product.isNew,
                is_popular: product.isPopular
            };

            const { error } = await supabase.from('products').insert([dbPayload]);
            if (error) throw error;
            await fetchProducts();
        } catch (err: any) {
            console.error('Error adding product:', err);
            throw err;
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            // Map updates keys to snake_case
            const dbUpdates: any = {};
            if (updates.title !== undefined) dbUpdates.title = updates.title;
            if (updates.catchCopy !== undefined) dbUpdates.catch_copy = updates.catchCopy;
            if (updates.price !== undefined) dbUpdates.price = updates.price;
            if (updates.category !== undefined) dbUpdates.category = updates.category;
            if (updates.image !== undefined) dbUpdates.image = updates.image;
            if (updates.images !== undefined) dbUpdates.images = updates.images;
            if (updates.specs !== undefined) dbUpdates.specs = updates.specs;
            if (updates.targetAudience !== undefined) dbUpdates.target_audience = updates.targetAudience;
            if (updates.benefits !== undefined) dbUpdates.benefits = updates.benefits;
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.howTo !== undefined) dbUpdates.how_to = updates.howTo;
            if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
            if (updates.isPopular !== undefined) dbUpdates.is_popular = updates.isPopular;

            const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
            if (error) throw error;
            await fetchProducts();
        } catch (err: any) {
            console.error('Error updating product:', err);
            throw err;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            await fetchProducts();
        } catch (err: any) {
            console.error('Error deleting product:', err);
            throw err;
        }
    };

    return (
        <AppDataContext.Provider value={{
            products,
            notifications,
            isLoading,
            error,
            refreshProducts: fetchProducts,
            refreshNotifications: fetchNotifications,
            addProduct,
            updateProduct,
            deleteProduct,
            addNotification
        }}>
            {children}
        </AppDataContext.Provider>
    );
};
