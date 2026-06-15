import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  AlertCircle,
  BookMarked,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';

export function Library() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'catalog' | 'issued'>('catalog');

  const { data, isLoading, error } = useApi(
    () => api.fetchLibrary({ search, tab }),
    [search, tab],
  );

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60 gap-3">
        <AlertTriangle className="w-8 h-8 text-white/40" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const books = data?.books || [];
  const stats = data?.stats || { totalCatalog: 0, myIssued: 0, overdue: 0, available: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Library</h1>
        <p className="text-white/50 mt-1">Browse catalog & manage issued books</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Catalog', value: stats.totalCatalog.toString(), icon: BookOpen },
          { label: 'Issued', value: stats.myIssued.toString(), icon: BookMarked },
          { label: 'Overdue', value: stats.overdue.toString(), icon: AlertCircle },
          { label: 'Available', value: stats.available.toString(), icon: CheckCircle2 },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card-dark p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-white/40" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/20 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark pl-10"
          />
        </div>
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
          {(['catalog', 'issued'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                tab === t ? 'bg-white text-black' : 'text-white/30 hover:text-white/50'
              }`}
            >
              {t === 'issued' ? 'My Books' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Books List */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-dark">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th className="text-center">Status</th>
                {tab === 'issued' && <th className="text-center">Due Date</th>}
              </tr>
            </thead>
            <tbody>
              {books.length === 0 && (
                <tr>
                  <td colSpan={tab === 'issued' ? 5 : 4} className="text-center text-white/40 py-8">
                    {tab === 'issued' ? 'No books currently issued' : 'No books found'}
                  </td>
                </tr>
              )}
              {books.map((book: any, i: number) => (
                <motion.tr
                  key={book.isbn}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <td className="font-medium text-white/90">{book.title}</td>
                  <td className="text-white/50">{book.author}</td>
                  <td className="text-white/40 text-xs font-mono">{book.isbn}</td>
                  <td className="text-center">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${
                      book.status === 'available' ? 'border-white/30 text-white font-bold' :
                      book.status === 'overdue' ? 'border-white/10 text-white/20 line-through' : 'border-white/20 text-white/60'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                  {tab === 'issued' && (
                    <td className={`text-center text-[10px] font-bold uppercase tracking-widest ${
                      book.status === 'overdue' ? 'text-white/40 line-through' : 'text-white/60 font-semibold'
                    }`}>
                      {book.dueDate ? new Date(book.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
