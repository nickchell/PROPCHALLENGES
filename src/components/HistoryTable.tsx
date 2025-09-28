import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { TradingHistoryRecord } from '../lib/supabase';

interface HistoryTableProps {
  history: TradingHistoryRecord[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'Pass':
        return `${baseClasses} text-green-700 bg-green-100`;
      case 'Fail':
        return `${baseClasses} text-red-700 bg-red-100`;
      default:
        return `${baseClasses} text-blue-700 bg-blue-100`;
    }
  };

  if (history.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
      >
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No trading history yet. Submit your first day's results to get started!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Trading History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phase
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trade Amounts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Used
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Daily P/L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drawdown
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((record, index) => (
              <motion.tr
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{record.day_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Phase {record.phase}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="space-y-1">
                    {record.trade_amounts && record.trade_amounts.length > 0 ? (
                      record.trade_amounts.map((amount, index) => (
                        <div key={index} className={`flex items-center gap-1 ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {amount >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="font-mono text-xs">
                            {amount >= 0 ? '+' : ''}${amount.toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          {record.wins}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <TrendingDown className="w-3 h-3" />
                          {record.losses}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${record.risk_used.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={record.daily_pl >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {record.daily_pl >= 0 ? '+' : ''}${record.daily_pl.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ${record.balance.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${record.drawdown.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(record.status)}>
                    {record.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};