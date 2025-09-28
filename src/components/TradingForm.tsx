import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface TradingFormProps {
  currentRisk: number;
  tradesPerDay: number;
  onSubmitTrades: (wins: number, losses: number) => void;
  disabled: boolean;
}

export const TradingForm: React.FC<TradingFormProps> = ({
  currentRisk,
  tradesPerDay,
  onSubmitTrades,
  disabled
}) => {
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  const totalTrades = wins + losses;
  const isValidTotal = totalTrades === tradesPerDay;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidTotal && !disabled) {
      onSubmitTrades(wins, losses);
      setWins(0);
      setLosses(0);
    }
  };

  const potentialPL = wins * (currentRisk * 3) - losses * currentRisk;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wins Today
            </label>
            <input
              type="number"
              min="0"
              max={tradesPerDay}
              value={wins}
              onChange={(e) => setWins(Number(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Losses Today
            </label>
            <input
              type="number"
              min="0"
              max={tradesPerDay}
              value={losses}
              onChange={(e) => setLosses(Number(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Risk ($)
            </label>
            <input
              type="text"
              value={`$${currentRisk.toFixed(2)}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Total Trades: {totalTrades} / {tradesPerDay}
            </span>
            {!isValidTotal && (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">Potential P/L: </span>
            <span className={`font-semibold ${potentialPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {potentialPL >= 0 ? '+' : ''}${potentialPL.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValidTotal || disabled}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {disabled ? 'Challenge Complete' : 'Submit Daily Results'}
        </button>
      </form>
    </motion.div>
  );
};