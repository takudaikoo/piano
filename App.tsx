import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, PRODUCTS, REVIEWS } from './constants';
import { Product, CategoryId } from './types';

// --- Icons ---
const Icons = {
  ShoppingCart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>,
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Star: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-yellow"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>,
};

// --- Components ---

const Header = () => (
  <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-stone-100 shadow-sm">
    <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
      <h1 className="text-lg font-bold text-brand-900 tracking-tight">
        〇〇式幼児指導法<span className="text-brand-500 ml-1">公式教材</span>
      </h1>
      <button className="p-2 hover:bg-stone-100 rounded-full relative">
        <Icons.ShoppingCart />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </div>
  </header>
);

const CategoryFilter = ({ activeCategory, onSelect }: { activeCategory: CategoryId, onSelect: (id: CategoryId) => void }) => (
  <div className="py-6 px-4 overflow-x-auto no-scrollbar">
    <div className="flex space-x-3 min-w-max">
      <button
        onClick={() => onSelect('all')}
        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'all'
          ? 'bg-brand-600 text-white shadow-md transform scale-105'
          : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-300'
          }`}
      >
        全て
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeCategory === cat.id
            ? `${cat.color} ring-2 ring-offset-1 ring-current shadow-sm`
            : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-300'
            }`}
        >
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const ProductCard: React.FC<{ product: Product, onClick: () => void }> = ({ product, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
  >
    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {product.isNew && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
          NEW
        </span>
      )}
      {product.isPopular && (
        <span className="absolute top-2 left-2 bg-accent-yellow text-brand-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
          人気No.1
        </span>
      )}
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <p className="text-xs text-brand-600 font-bold mb-1">{product.catchCopy}</p>
      <h3 className="text-stone-800 font-bold leading-tight mb-2 flex-grow">{product.title}</h3>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-lg font-bold text-stone-900">¥{product.price.toLocaleString()}</span>
        <span className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded">詳細はコチラ</span>
      </div>
    </div>
  </div>
);

const ProductDetail = ({ product, onBack, onAddToCart, onProductClick }: { product: Product, onBack: () => void, onAddToCart: () => void, onProductClick: (p: Product) => void }) => {
  // Cross-selling logic
  const relatedProducts = useMemo(() => {
    return PRODUCTS.filter(p =>
      p.category === product.category &&
      p.id !== product.id
    ).slice(0, 3);
  }, [product]);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product]);

  return (
    <div className="bg-white min-h-screen pb-24 animate-fade-in">
      {/* Sticky Header for Detail */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-100 px-4 h-14 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-stone-500 hover:text-brand-600">
          <Icons.ArrowLeft />
          <span className="ml-1 text-sm font-bold">戻る</span>
        </button>
        <span className="font-bold text-stone-800 text-sm truncate max-w-[200px]">{product.title}</span>
        <div className="w-6"></div> {/* Spacer */}
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Images */}
        <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            1 / {product.images.length}
          </div>
        </div>

        {/* Main Info */}
        <div className="px-5 py-6">
          <div className="flex gap-2 mb-3">
            <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-1 rounded">PDF教材</span>
            <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded">{CATEGORIES.find(c => c.id === product.category)?.label}</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">{product.title}</h1>
          <p className="text-brand-600 font-bold mb-4">{product.catchCopy}</p>
          <div className="flex items-baseline gap-2 mb-6 border-b border-stone-100 pb-6">
            <span className="text-3xl font-bold text-stone-900">¥{product.price.toLocaleString()}</span>
            <span className="text-sm text-stone-500">（税込）</span>
          </div>

          {/* Specs */}
          <div className="bg-stone-50 rounded-lg p-4 mb-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-stone-400 mb-1">形式</div>
                <div className="font-bold text-stone-700 flex justify-center items-center gap-1"><Icons.FileText /> {product.specs.format}</div>
              </div>
              <div>
                <div className="text-xs text-stone-400 mb-1">サイズ</div>
                <div className="font-bold text-stone-700">{product.specs.size}</div>
              </div>
              <div>
                <div className="text-xs text-stone-400 mb-1">ページ数</div>
                <div className="font-bold text-stone-700">{product.specs.pages}p</div>
              </div>
            </div>
          </div>

          {/* Solution / Benefits */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
              こんな生徒さんに効果的
            </h2>
            <div className="space-y-3">
              {product.targetAudience.map((target, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-brand-50/50 p-3 rounded-lg">
                  <div className="mt-0.5 text-brand-500"><Icons.Check /></div>
                  <span className="text-stone-700 font-medium">{target}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
              使用後の変化
            </h2>
            <div className="prose prose-stone text-stone-600 leading-relaxed">
              {product.description}
              <ul className="mt-4 space-y-2 list-none pl-0">
                {product.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-accent-yellow"><Icons.Star /></span>
                    <span className="font-bold text-stone-800">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* How to */}
          <div className="bg-stone-800 text-stone-200 rounded-xl p-6 mb-12 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-white mb-2">使い方のヒント</h3>
              <p className="text-sm leading-relaxed opacity-90">{product.howTo}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-stone-700 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>

          {/* Cross Selling Section */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-dashed border-stone-300 pt-10 mt-10">
              <div className="text-center mb-6">
                <p className="inline-block bg-accent-yellow/20 text-brand-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                  あわせて買うとレッスン効果2倍！
                </p>
                <h3 className="text-xl font-bold text-stone-800">
                  この教材と一緒に使われているアイテム
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {relatedProducts.map(related => (
                  <div
                    key={related.id}
                    onClick={() => onProductClick(related)}
                    className="bg-white border border-stone-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="aspect-square bg-stone-100 rounded mb-3 overflow-hidden">
                      <img src={related.image} alt={related.title} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs text-stone-500 mb-1">{CATEGORIES.find(c => c.id === related.category)?.label}</p>
                    <h4 className="font-bold text-stone-800 text-sm leading-tight mb-2 line-clamp-2 flex-grow">{related.title}</h4>
                    <p className="text-brand-600 font-bold text-sm">¥{related.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-3xl mx-auto flex gap-4">
          <div className="hidden sm:block">
            <p className="text-xs text-stone-500">価格</p>
            <p className="text-xl font-bold text-stone-900">¥{product.price.toLocaleString()}</p>
          </div>
          <button
            onClick={onAddToCart}
            className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Icons.ShoppingCart />
            カートに入れる
          </button>
        </div>
      </div>
    </div>
  );
};

import AdminDashboard from './AdminDashboard';

const App = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} />;
  }

  // View: Product Detail
  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={handleBack}
        onAddToCart={() => alert('カート機能は準備中です')}
        onProductClick={handleProductClick}
      />
    );
  }

  // View: Home
  return (
    <div className="bg-stone-50 min-h-screen pb-12">
      <Header />

      {/* Hero Section */}
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-2 leading-tight">
            「あの子」が飽きずに夢中になる。
          </h2>
          <p className="text-brand-700 font-medium">
            大手教本では届かない「かゆい所」に手が届く教材ライブラリ
          </p>
        </div>
      </div>

      {/* Search/Filter */}
      <div className="sticky top-16 z-30 bg-stone-50/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-4xl mx-auto">
          <CategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* New Arrivals (Only on 'all' view) */}
        {activeCategory === 'all' && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-800 text-lg flex items-center gap-2">
                <span className="text-xl">🆕</span> 今月の新作
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PRODUCTS.filter(p => p.isNew).map(product => (
                <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
              ))}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="mb-4">
          <h3 className="font-bold text-stone-800 text-lg mb-4">
            {activeCategory === 'all' ? '教材一覧' : `${CATEGORIES.find(c => c.id === activeCategory)?.label}の教材`}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onClick={() => handleProductClick(product)} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              該当する教材はまだありません
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-100">
          <h3 className="text-center font-bold text-stone-800 text-xl mb-8">なぜ、〇〇式の教材は子供が喜ぶのか？</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🎓</div>
              <h4 className="font-bold mb-2 text-stone-700">現場目線の工夫</h4>
              <p className="text-sm text-stone-500 leading-relaxed">実際のレッスンでの「つまづき」から生まれた、リアルな解決策です。</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-yellow/20 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">⚡</div>
              <h4 className="font-bold mb-2 text-stone-700">印刷して即戦力</h4>
              <p className="text-sm text-stone-500 leading-relaxed">PDFを印刷するだけ。明日のレッスンからすぐに使えます。</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🎨</div>
              <h4 className="font-bold mb-2 text-stone-700">子供が惹かれる</h4>
              <p className="text-sm text-stone-500 leading-relaxed">幼児の色彩心理に基づいたデザインで、自然と興味を持ちます。</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12 mb-12">
          <h3 className="font-bold text-stone-800 text-lg mb-4 text-center">先生たちの声</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {REVIEWS.map(review => (
              <div key={review.id} className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm relative">
                <div className="absolute -top-3 left-6 text-4xl text-stone-200">"</div>
                <p className="text-stone-700 text-sm leading-relaxed mb-4 relative z-10">{review.content}</p>
                <div className="flex items-center gap-3 border-t border-stone-100 pt-3">
                  <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-xs font-bold text-stone-500">
                    {review.author[0]}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-800">{review.author}</div>
                    <div className="text-[10px] text-stone-500">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="bg-stone-800 text-stone-400 py-8 text-center text-xs">
        <p>&copy; 2024 〇〇式幼児指導法 All Rights Reserved.</p>
        <button onClick={() => setShowAdmin(true)} className="mt-4 inline-block text-stone-300 hover:text-white underline font-bold px-4 py-2 border border-stone-600 rounded">
          管理者ログイン
        </button>
      </footer>
    </div>
  );
};

export default App;