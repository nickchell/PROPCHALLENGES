import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface TradingFormProps {
  currentRisk: number;
  tradesPerDay: number;
  onSubmitTrades: (tradeAmounts: number[]) => void;
  disabled: boolean;
}

export const TradingForm: React.FC<TradingFormProps> = ({
  currentRisk,
  tradesPerDay,
  onSubmitTrades,
  disabled
}) => {
  const [tradeAmounts, setTradeAmounts] = useState<number[]>(new Array(tradesPerDay).fill(0));

  const handleTradeAmountChange = (index: number, value: string) => {
    const newAmounts = [...tradeAmounts];
    newAmounts[index] = parseFloat(value) || 0;
    setTradeAmounts(newAmounts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled) {
      onSubmitTrades(tradeAmounts);
      setTradeAmounts(new Array(tradesPerDay).fill(0));
    }
  };

  const totalPL = tradeAmounts.reduce((sum, amount) => sum + amount, 0);
  const allTradesEntered = tradeAmounts.every(amount => amount !== 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-900">Daily Trading Results</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Enter Trade Results</h3>
            <div className="text-sm text-gray-500">
              Current Risk: ${currentRisk.toFixed(2)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tradeAmounts.map((amount, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trade {index + 1} P/L ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount === 0 ? '' : amount}
                    onChange={(e) => handleTradeAmountChange(index, e.target.value)}
                    disabled={disabled}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {amount > 0 ? 'Profit' : amount < 0 ? 'Loss' : 'Enter amount'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Trades Entered: {tradeAmounts.filter(amount => amount !== 0).length} / {tradesPerDay}
            </span>
            {!allTradesEntered && (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">Total P/L: </span>
            <span className={`font-semibold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!allTradesEntered || disabled}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {disabled ? 'Challenge Complete' : 'Submit Daily Results'}
        </button>
      </form>
    </motion.div>
  );
};