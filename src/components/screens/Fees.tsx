import { motion } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  IndianRupee,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import * as api from '../../lib/api';

export function Fees() {
  const { data, isLoading, error } = useApi(() => api.fetchFees(), []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/60 gap-3">
        <AlertTriangle className="w-8 h-8 text-white/40" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const breakdown = data?.breakdown || [];
  const paymentHistory = data?.paymentHistory || [];
  const stats = data?.stats || { totalFee: 0, paidAmount: 0, pendingAmount: 0, overdueCount: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Fees & Payments</h1>
        <p className="text-white/50 mt-1">Fee details and payment history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fee', value: `₹${(stats.totalFee/1000).toFixed(0)}K`, icon: IndianRupee },
          { label: 'Paid', value: `₹${(stats.paidAmount/1000).toFixed(0)}K`, icon: CheckCircle2 },
          { label: 'Pending', value: `₹${(stats.pendingAmount/1000).toFixed(0)}K`, icon: Clock },
          { label: 'Overdue', value: stats.overdueCount.toString(), icon: AlertCircle },
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

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Fee Breakdown */}
        <div className="lg:col-span-3 card-dark overflow-hidden">
          <div className="p-5 pb-3">
            <h3 className="text-base font-semibold text-white">Fee Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-dark">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((fee: any, i: number) => (
                  <motion.tr
                    key={fee.id || fee.item}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    <td className="font-medium text-white/85">{fee.item}</td>
                    <td className="text-right text-white/70">₹{fee.amount.toLocaleString()}</td>
                    <td className="text-center">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${
                        fee.status === 'paid' ? 'border-white/30 text-white font-bold' :
                        fee.status === 'overdue' ? 'border-white/10 text-white/20 line-through' : 'border-white/20 text-white/60'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/[0.08]">
                  <td className="font-bold text-white pt-5">Total</td>
                  <td className="text-right font-bold text-white pt-5 text-lg">₹{stats.totalFee.toLocaleString()}</td>
                  <td className="pt-5 text-center">
                    <button className="bg-white text-black px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all">Pay Now</button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2 card-dark p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-white/40" />
            <h3 className="text-base font-semibold text-white">Payment History</h3>
          </div>
          <div className="space-y-3">
            {paymentHistory.length === 0 && (
              <p className="text-sm text-white/40 text-center py-6">No payment history</p>
            )}
            {paymentHistory.map((pay: any, i: number) => (
              <motion.div
                key={pay.ref || i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-transparent hover:border-white/[0.06] hover:bg-white/[0.04] transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/85">₹{pay.amount.toLocaleString()}</p>
                  <p className="text-xs text-white/35">
                    {new Date(pay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {pay.method}
                  </p>
                </div>
                <button className="p-1.5 rounded hover:bg-white/[0.06] transition-colors">
                  <Download className="w-4 h-4 text-white/30" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
