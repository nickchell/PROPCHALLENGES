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
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Challenge Configuration</h2>
            <p className="text-sm text-gray-600">
              {userName.charAt(0).toUpperCase() + userName.slice(1)} - Phase {currentPhase}
            </p>
          </div>
        </div>
        <button
          onClick={onSwitchUser}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
        >
          Switch User
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Current Target:</strong> ${getCurrentTarget().toFixed(2)} 
          ({currentPhase === 1 ? '8%' : '5%'} of starting balance)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Starting Balance ($)
          </label>
          <input
            type="number"
            value={config.startingBalance}
            onChange={(e) => handleInputChange('startingBalance', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phase 1 Target ($)
          </label>
          <input
            type="number"
            value={config.phase1Target}
            onChange={(e) => handleInputChange('phase1Target', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phase 2 Target ($)
          </label>
          <input
            type="number"
            value={config.phase2Target}
            onChange={(e) => handleInputChange('phase2Target', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daily Loss Limit ($)
          </label>
          <input
            type="number"
            value={config.dailyLossLimit}
            onChange={(e) => handleInputChange('dailyLossLimit', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Drawdown ($)
          </label>
          <input
            type="number"
            value={config.maxDrawdown}
            onChange={(e) => handleInputChange('maxDrawdown', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trades Per Day
          </label>
          <input
            type="number"
            value={config.tradesPerDay}
            onChange={(e) => handleInputChange('tradesPerDay', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reward Ratio (R)
          </label>
          <input
            type="number"
            value={config.rewardRatio}
            onChange={(e) => handleInputChange('rewardRatio', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Cap ($)
          </label>
          <input
            type="number"
            value={config.riskCap}
            onChange={(e) => handleInputChange('riskCap', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Risk Floor ($)
          </label>
          <input
            type="number"
            value={config.riskFloor}
            onChange={(e) => handleInputChange('riskFloor', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
};