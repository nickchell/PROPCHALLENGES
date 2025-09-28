import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

interface ConfigPanelProps {
  config: {
    startingBalance: number;
    phase1Target: number;
    phase2Target: number;
    dailyLossLimit: number;
    maxDrawdown: number;
    tradesPerDay: number;
    rewardRatio: number;
    riskCap: number;
    riskFloor: number;
  };
  currentPhase: number;
  userName: string;
  onConfigChange: (config: any) => void;
  onSwitchUser: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  config, 
  currentPhase, 
  userName, 
  onConfigChange, 
  onSwitchUser 
}) => {
  const handleInputChange = (field: string, value: number) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  const getCurrentTarget = () => {
    return currentPhase === 1 ? config.phase1Target : config.phase2Target;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <div>
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">Challenge Configuration</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {userName.charAt(0).toUpperCase() + userName.slice(1)} - Phase {currentPhase}
            </p>
          </div>
        </div>
        <button
          onClick={onSwitchUser}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium px-2 sm:px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
        >
          Switch User
        </button>
      </div>

      <div className="mb-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>Current Target:</strong> ${getCurrentTarget().toFixed(2)} 
          ({currentPhase === 1 ? '8%' : '5%'} of starting balance)
        </p>
      </div>

      {/* Compact Table-like Layout */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-700">Parameter</th>
              <th className="text-right py-2 px-3 font-medium text-gray-700">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2 px-3 text-gray-600">Starting Balance</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={config.startingBalance}
                  onChange={(e) => handleInputChange('startingBalance', Number(e.target.value))}
                  className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">Phase 1 Target</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={config.phase1Target}
                  onChange={(e) => handleInputChange('phase1Target', Number(e.target.value))}
                  className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">Phase 2 Target</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={config.phase2Target}
                  onChange={(e) => handleInputChange('phase2Target', Number(e.target.value))}
                  className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">Daily Loss Limit</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={config.dailyLossLimit}
                  onChange={(e) => handleInputChange('dailyLossLimit', Number(e.target.value))}
                  className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">Max Drawdown</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={config.maxDrawdown}
                  onChange={(e) => handleInputChange('maxDrawdown', Number(e.target.value))}
                  className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">Trades Per Day</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={config.tradesPerDay}
                  onChange={(e) => handleInputChange('tradesPerDay', Number(e.target.value))}
                  className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">Reward Ratio</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={config.rewardRatio}
                  onChange={(e) => handleInputChange('rewardRatio', Number(e.target.value))}
                  className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">Risk Cap</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={config.riskCap}
                  onChange={(e) => handleInputChange('riskCap', Number(e.target.value))}
                  className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">Risk Floor</td>
              <td className="py-2 px-3">
                <input
                  type="number"
                  value={config.riskFloor}
                  onChange={(e) => handleInputChange('riskFloor', Number(e.target.value))}
                  className="w-full text-right px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};