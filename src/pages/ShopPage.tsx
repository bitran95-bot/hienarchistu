import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { client, urlFor } from '../sanityClient';
import { useTranslation } from '../i18n';

import type { Product, ProductCategory } from '../types';
import { SubpageNavigation } from '../components/SubpageNavigation';

// ===== PRODUCT CARD =====
function ProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const { t } = useTranslation();
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;
  const imageUrl = product.image?.asset
    ? urlFor(product.image as any).width(600).height(400).quality(85).auto('format').url()
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100"
      onClick={() => onSelect(product)}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] bg-stone-100 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>
          </div>
        )}
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            product.category === 'revit-family' 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {product.category === 'revit-family' ? t.shop.filterFamily : t.shop.filterTemplate}
          </span>
        </div>
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{Math.round((1 - product.salePrice! / product.price) * 100)}%
          </div>
        )}
        {product.featured && (
          <div className="absolute bottom-3 left-3 bg-amber-700 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            {t.shop.featured}
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="p-5">
        <h3 className="font-heading font-bold text-[#2a2a2a] text-lg leading-tight mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-stone-500 mb-3 line-clamp-2">{product.description}</p>
        )}
        {product.compatibility && (
          <p className="text-xs text-stone-400 mb-3">📋 {product.compatibility}</p>
        )}
        <div className="flex items-end justify-between">
          <div>
            {product.price === 0 ? (
              <span className="text-lg font-bold text-green-600">{t.shop.free}</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#2a2a2a]">{displayPrice.toLocaleString('vi-VN')}₫</span>
                {hasDiscount && (
                  <span className="text-sm text-stone-400 line-through">{product.price.toLocaleString('vi-VN')}₫</span>
                )}
              </div>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            {product.price === 0 ? t.shop.download : t.shop.buy}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ===== PRODUCT DETAIL MODAL =====
function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t } = useTranslation();
  const imageUrl = product.image?.asset
    ? urlFor(product.image as any).width(1200).quality(90).auto('format').url()
    : null;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-white transition-all shadow-lg" aria-label={t.contact.close}>
          ✕
        </button>

        <div className="md:flex">
          {/* Image side */}
          <div className="md:w-1/2 aspect-square bg-stone-100">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 text-6xl">📦</div>
            )}
          </div>
          
          {/* Info side */}
          <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
            <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
              product.category === 'revit-family' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {product.category === 'revit-family' ? t.shop.filterFamily : t.shop.filterTemplate}
            </span>

            <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#2a2a2a] mb-4 tracking-tight">{product.name}</h2>

            {product.description && (
              <p className="text-stone-600 leading-relaxed mb-6 whitespace-pre-wrap">{product.description}</p>
            )}

            <div className="space-y-2 mb-6 text-sm text-stone-500">
              {product.fileFormat && (
                <div className="flex items-center gap-2"><span className="text-stone-400">📁</span> {t.shop.fileFormat}: <strong className="text-stone-700">{product.fileFormat}</strong></div>
              )}
              {product.compatibility && (
                <div className="flex items-center gap-2"><span className="text-stone-400">⚙️</span> {t.shop.compatibility}: <strong className="text-stone-700">{product.compatibility}</strong></div>
              )}
            </div>

            <div className="mt-auto">
              <div className="mb-4">
                {product.price === 0 ? (
                  <span className="text-2xl font-bold text-green-600">{t.shop.free}</span>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-[#2a2a2a]">{displayPrice.toLocaleString('vi-VN')}₫</span>
                    {hasDiscount && (
                      <span className="text-lg text-stone-400 line-through">{product.price.toLocaleString('vi-VN')}₫</span>
                    )}
                  </div>
                )}
              </div>

              {product.price === 0 && product.downloadUrl ? (
                <a
                  href={product.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-4 rounded-2xl font-bold text-lg transition-colors"
                >
                  {t.shop.downloadFree}
                </a>
              ) : product.price > 0 ? (
                <button
                  onClick={async () => {
                    try {
                      const actualPrice = product.salePrice && product.salePrice < product.price
                        ? product.salePrice : product.price;
                      const resp = await fetch('/api/create-checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          productId: product._id,
                          productName: product.name,
                          price: actualPrice,
                        }),
                      });
                      const data = await resp.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        alert(data.error || 'Checkout error');
                      }
                    } catch {
                      alert('Could not connect to payment server.');
                    }
                  }}
                  className="block w-full bg-amber-700 hover:bg-amber-800 text-white text-center py-4 rounded-2xl font-bold text-lg transition-colors cursor-pointer"
                >
                  {t.shop.buyNow}
                </button>
              ) : (
                <button disabled className="block w-full bg-stone-300 text-stone-500 text-center py-4 rounded-2xl font-bold text-lg cursor-not-allowed">
                  {t.shop.comingSoon}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Gallery */}
        {product.gallery && product.gallery.length > 0 && (
          <div className="px-8 pb-8">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">{t.shop.previewImages}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {product.gallery.map((img, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
                  <img src={urlFor(img as any).width(400).quality(80).auto('format').url()} alt={`Preview ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ===== MAIN SHOP PAGE =====
export default function ShopPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const CATEGORIES: { value: ProductCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: t.shop.filterAll, icon: '🏠' },
    { value: 'revit-family', label: t.shop.filterFamily, icon: '📦' },
    { value: 'revit-template', label: t.shop.filterTemplate, icon: '📐' },
  ];

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    client.fetch<Product[]>(`*[_type == "product"] | order(order asc) { ..., "slug": slug }`)
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Escape closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProduct(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <>
      <Helmet>
        <title>{t.shop.pageTitle}</title>
        <meta name="description" content={t.shop.pageDesc} />
        <meta property="og:title" content={t.shop.pageTitle} />
        <meta property="og:description" content={t.shop.pageDesc} />
      </Helmet>

      <div className="min-h-screen bg-[#fdfbf7]">
        <SubpageNavigation />

        {/* HERO */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-transparent to-stone-50 opacity-70" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-heading font-bold text-4xl md:text-6xl text-[#2a2a2a] tracking-tight mb-4"
            >
              {t.shop.heroTitle} <span className="text-amber-700">{t.shop.heroHighlight}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto"
            >
              {t.shop.heroSubtitle}
            </motion.p>
          </div>
        </section>

        {/* FILTER BAR */}
        <div className="sticky top-[65px] z-40 bg-[#fdfbf7]/90 backdrop-blur-lg border-b border-stone-200/30">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.value
                    ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/20'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
            <div className="ml-auto text-sm text-stone-400">
              {t.shop.productCount(filtered.length)}
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[3/2] bg-stone-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-100 rounded w-1/2" />
                    <div className="h-8 bg-stone-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-heading font-bold text-stone-500 mb-2">Không thể tải sản phẩm</h3>
              <p className="text-stone-400 mb-6 max-w-md mx-auto">{error}</p>
              <button 
                onClick={fetchProducts}
                className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                🔄 Thử lại
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-heading font-bold text-stone-400 mb-2">{t.shop.emptyTitle}</h3>
              <p className="text-stone-400">{t.shop.emptyText}</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => (
                  <ProductCard key={product._id} product={product} onSelect={setSelectedProduct} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="border-t border-stone-200/50 bg-white/50 py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-heading font-bold text-stone-300 text-lg">HIÊN studio</div>
            <p className="text-sm text-stone-400">{t.shop.footerCopy(new Date().getFullYear())}</p>
            <Link to="/" className="text-sm text-amber-700 hover:text-amber-800 font-medium transition-colors">
              {t.shop.backHomeFooter}
            </Link>
          </div>
        </footer>
      </div>

      {/* PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
