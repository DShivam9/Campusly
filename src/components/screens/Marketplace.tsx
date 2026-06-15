import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Plus,
  Loader2,
  AlertTriangle,
  X,
  DollarSign,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../lib/api';

const MOCK_PRODUCTS = [
  {
    id: 'm1',
    title: 'iPad Pro 11" (M1)',
    description: 'Perfect for taking notes and studying. Includes Apple Pencil 2.',
    price: 45000,
    category: 'Electronics',
    condition: 'Excellent',
    seller: 'Rahul Dev',
    image: '📱'
  },
  {
    id: 'm2',
    title: 'Engineering Thermostat',
    description: 'Required for ME402 course. Barely used.',
    price: 1200,
    category: 'Books & Supplies',
    condition: 'Good',
    seller: 'Priya S.',
    image: '📐'
  },
  {
    id: 'm3',
    title: 'Herman Miller Chair',
    description: 'Top tier ergonomics for long study sessions.',
    price: 15000,
    category: 'Furniture',
    condition: 'Refurbished',
    seller: 'Alex J.',
    image: '🪑'
  }
];

export function Marketplace() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isPosting, setIsPosting] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    price: '',
    category: 'Electronics',
    condition: 'Good',
    description: ''
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { data, isLoading, error, refetch } = useApi(() => api.fetchMarketplace(), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent-light animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60 gap-3">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const listings = data?.items && data.items.length > 0 ? data.items : MOCK_PRODUCTS;
  const categories = ['all', ...new Set(listings.map((l: any) => l.category || 'other'))];

  const filtered = listings.filter((l: any) => {
    if (isAdmin && search === 'status:pending') {
      return l.status === 'pending';
    }
    const matchesSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || l.category === category;
    return matchesSearch && matchesCategory;
  });

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.postMarketplaceItem({
        ...postForm,
        price: Number(postForm.price),
        imageUrls: ['https://placeholder.com/image.jpg']
      });
      setIsPosting(false);
      setPostForm({
        title: '',
        price: '',
        category: 'Electronics',
        condition: 'Good',
        description: ''
      });
      refetch();
      alert('Product listed successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to post item: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-white/50 mt-1">
            {isAdmin ? 'Review and approve campus marketplace listings' : 'Buy and sell with your campus community'}
          </p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setIsPosting(true)}
            className="btn-primary flex items-center gap-2 text-sm self-start"
          >
            <Plus className="w-4 h-4" />
            Post Item
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-dark w-auto min-w-[140px]"
        >
          {categories.map((cat: string) => (
            <option key={cat} value={cat} className="bg-surface-100 text-white capitalize">
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
        
        {isAdmin && (
          <select
            value={search === 'status:pending' ? 'pending' : 'all'}
            onChange={(e) => setSearch(e.target.value === 'pending' ? 'status:pending' : '')}
            className="input-dark w-auto border-amber-500/30 text-amber-500/80"
          >
            <option value="all">View All</option>
            <option value="pending">Review Pending</option>
          </select>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <p className="text-sm text-white/40 text-center py-8 col-span-full">No listings found</p>
        )}
        {filtered.map((product: any, i: number) => (
          <motion.div
            key={product.id || i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`card-dark p-5 hover:border-white/[0.12] transition-colors group ${product.status === 'pending' ? 'border-amber-900/40 opacity-70' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-4xl">{product.image || '📦'}</div>
              <div className="flex items-center gap-2">
                {product.status === 'pending' && (
                  <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Pending
                  </span>
                )}
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase tracking-widest">
                  {product.category}
                </span>
              </div>
            </div>
            <h3 className="text-base font-semibold text-white/90 mb-1 group-hover:text-white transition-colors">
              {product.title}
            </h3>
            <p className="text-xs text-white/40 mb-3">by {product.seller}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-white">₹{product.price}</span>
              <div className="flex items-center gap-1 text-zinc-500 text-xs">
                {product.condition}
              </div>
            </div>
            
            <div className="flex gap-2">
              {isAdmin && product.status === 'pending' ? (
                <>
                  <button 
                    onClick={async () => {
                      await api.updateMarketplaceItemStatus(product.id, 'approved');
                      refetch();
                    }}
                    className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-all"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={async () => {
                      await api.updateMarketplaceItemStatus(product.id, 'rejected');
                      refetch();
                    }}
                    className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10 text-white/60 hover:bg-white/5 transition-all"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setSelectedProduct(product)}
                  className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/[0.04] hover:bg-white text-white/40 hover:text-black border border-white/[0.06] hover:border-white transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  View Details
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 aspect-square flex items-center justify-center text-8xl bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/10 select-none">
                  {selectedProduct.image || '📦'}
                </div>
                
                <div className="flex-1 p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                          {selectedProduct.category}
                        </span>
                        <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                          {selectedProduct.condition}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">{selectedProduct.title}</h2>
                    </div>
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-white/20 hover:text-white" />
                    </button>
                  </div>

                  <div className="flex-1 mb-8">
                    <p className="text-white/60 leading-relaxed text-sm">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="space-y-6 mt-auto">
                    <div className="flex items-end justify-between border-t border-white/5 pt-6">
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-1">Listed Price</p>
                        <p className="text-3xl font-light text-white tracking-tighter">₹{selectedProduct.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-1">Seller Identity</p>
                        <p className="text-sm font-semibold text-white/60">{selectedProduct.seller}</p>
                      </div>
                    </div>

                    <button className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-2xl">
                      <ShoppingBag className="w-4 h-4" />
                      Inquire / Negotiate
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Modal */}
      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPosting(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white">Post New Item</h2>
                <button 
                  onClick={() => setIsPosting(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              </div>

              <form onSubmit={handlePost} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Item Title</label>
                  <input
                    required
                    value={postForm.title}
                    onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="What are you selling?"
                    className="input-dark w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Price (₹)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        required
                        type="number"
                        value={postForm.price}
                        onChange={e => setPostForm({ ...postForm, price: e.target.value })}
                        placeholder="0.00"
                        className="input-dark w-full pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Category</label>
                    <select
                      value={postForm.category}
                      onChange={e => setPostForm({ ...postForm, category: e.target.value })}
                      className="input-dark w-full"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Books & Supplies">Books & Supplies</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-white/40">Description</label>
                  <textarea
                    required
                    value={postForm.description}
                    onChange={e => setPostForm({ ...postForm, description: e.target.value })}
                    placeholder="Describe your item, condition, etc."
                    className="input-dark w-full min-h-[100px] py-3"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPosting(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 font-semibold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 rounded-xl bg-accent text-black font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    List Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
