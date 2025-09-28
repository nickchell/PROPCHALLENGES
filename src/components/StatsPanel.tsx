import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Target, AlertCircle, TrendingDown } from 'lucide-react';

interface StatsPanelProps {
  balance: number;
  startingBalance: number;
  currentTarget: number;
  phase: number;
  peakBalance: number;
  drawdown: number;
  maxDrawdown: number;
  dailyPL: number;
  status: 'Ongoing' | 'Pass' | 'Fail';
  nextRisk: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  balance,
  startingBalance,
  currentTarget,
  phase,
  peakBalance,
  drawdown,
  maxDrawdown,
  dailyPL,
  status,
  nextRisk
}) => {
  const profit = balance - startingBalance;
  const profitPercentage = (profit / startingBalance) * 100;
  const targetProgress = Math.min((profit / currentTarget) * 100, 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass': return 'text-green-600 bg-green-50';
      case 'Fail': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <h3 className="text-xs sm:text-sm font-medium text-gray-700">Current Balance</h3>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">${balance.toFixed(2)}</p>
          <p className={`text-xs sm:text-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profit >= 0 ? '+' : ''}${profit.toFixed(2)} ({profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%)
          </p>
          {dailyPL !== 0 && (
            <p className={`text-xs ${dailyPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              Today: {dailyPL >= 0 ? '+' : ''}${dailyPL.toFixed(2)}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h3 className="text-xs sm:text-sm font-medium text-gray-700">Phase {phase} Target</h3>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">${currentTarget.toFixed(2)}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {targetProgress.toFixed(1)}% complete ({phase === 1 ? '8%' : '5%'} target)
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          <h3 className="text-xs sm:text-sm font-medium text-gray-700">Current Drawdown</h3>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">${drawdown.toFixed(2)}</p>
          <p className="text-xs text-gray-500">
            Peak: ${peakBalance.toFixed(2)}
          </p>
          <p className={`text-xs ${drawdown >= maxDrawdown * 0.8 ? 'text-red-500' : 'text-gray-500'}`}>
            Max: ${maxDrawdown.toFixed(2)}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          <h3 className="text-xs sm:text-sm font-medium text-gray-700">Status</h3>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <span className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
          <p className="text-xs sm:text-sm text-gray-600">Next Risk: ${nextRisk.toFixed(2)}</p>
        </div>
      </motion.div>
    </div>
  );
};