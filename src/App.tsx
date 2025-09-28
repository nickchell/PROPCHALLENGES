import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, RefreshCw } from 'lucide-react';
import { UserSelector } from './components/UserSelector';
import { ConfigPanel } from './components/ConfigPanel';
import { TradingForm } from './components/TradingForm';
import { StatsPanel } from './components/StatsPanel';
import { HistoryTable } from './components/HistoryTable';
import { supabase, TradingHistoryRecord, USER_PROFILES } from './lib/supabase';
import { useLocalStorage } from './hooks/useLocalStorage';

interface Config {
  startingBalance: number;
  phase1Target: number;
  phase2Target: number;
  dailyLossLimit: number;
  maxDrawdown: number;
  tradesPerDay: number;
  rewardRatio: number;
  initialRisk: number;
  riskCap: number;
  riskFloor: number;
}

const DEFAULT_CONFIG: Config = {
  startingBalance: 6000,
  phase1Target: 480, // 8% of 6000
  phase2Target: 300, // 5% of 6000
  dailyLossLimit: 300, // 5% of 6000
  maxDrawdown: 600, // 10% of 6000
  tradesPerDay: 2,
  rewardRatio: 3,
  initialRisk: 80,
  riskCap: 90,
  riskFloor: 40,
};

function App() {
  const [selectedUser, setSelectedUser] = useLocalStorage<string | null>('selectedUser', null);
  const [config, setConfig] = useLocalStorage<Config>(`riskCalcConfig_${selectedUser}`, DEFAULT_CONFIG);
  const [balance, setBalance] = useLocalStorage<number>(`balance_${selectedUser}`, config.startingBalance);
  const [peakBalance, setPeakBalance] = useLocalStorage<number>(`peakBalance_${selectedUser}`, config.startingBalance);
  const [currentRisk, setCurrentRisk] = useLocalStorage<number>(`currentRisk_${selectedUser}`, config.initialRisk);
  const [dayNumber, setDayNumber] = useLocalStorage<number>(`dayNumber_${selectedUser}`, 1);
  const [currentPhase, setCurrentPhase] = useLocalStorage<number>(`currentPhase_${selectedUser}`, 1);
  const [status, setStatus] = useLocalStorage<'Ongoing' | 'Pass' | 'Fail'>(`status_${selectedUser}`, 'Ongoing');
  const [dailyPL, setDailyPL] = useState(0);
  const [history, setHistory] = useState<TradingHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Show user selector if no user is selected
  if (!selectedUser) {
    return <UserSelector profiles={USER_PROFILES} onSelectUser={setSelectedUser} />;
  }

  const drawdown = Math.max(0, peakBalance - balance);
  const currentTarget = currentPhase === 1 ? config.phase1Target : config.phase2Target;

  // Load trading history on mount
  useEffect(() => {
    if (selectedUser) {
      loadTradingHistory();
    }
  }, [selectedUser]);

  // Update peak balance when balance increases
  useEffect(() => {
    if (balance > peakBalance) {
      setPeakBalance(balance);
    }
  }, [balance, peakBalance, setPeakBalance]);

  const loadTradingHistory = async () => {
    if (!selectedUser) return;
    
    try {
      const { data, error } = await supabase
        .from('trading_history')
        .select('*')
        .eq('user_name', selectedUser)
        .order('day_number', { ascending: true });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading trading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRiskAdjustment = (dailyResult: number, currentRisk: number) => {
    let newRisk = currentRisk;
    
    if (dailyResult > 0) {
      newRisk = Math.min(currentRisk * 1.20, config.riskCap);
    } else if (dailyResult < 0) {
      newRisk = Math.max(currentRisk * 0.75, config.riskFloor);
    }
    
    // Safety check: risk cannot exceed daily loss limit / trades per day
    const maxSafeRisk = config.dailyLossLimit / config.tradesPerDay;
    newRisk = Math.min(newRisk, maxSafeRisk);
    
    return newRisk;
  };

  const handleSubmitTrades = async (wins: number, losses: number) => {
    if (!selectedUser) return;
    
    // Calculate daily P/L
    const winAmount = wins * (currentRisk * config.rewardRatio);
    const lossAmount = losses * currentRisk;
    const dailyPL = winAmount - lossAmount;
    
    // Update balance
    const newBalance = balance + dailyPL;
    const newPeakBalance = Math.max(peakBalance, newBalance);
    const newDrawdown = Math.max(0, newPeakBalance - newBalance);
    
    // Check for violations
    let newStatus: 'Ongoing' | 'Pass' | 'Fail' = 'Ongoing';
    let newPhase = currentPhase;
    
    if (dailyPL <= -config.dailyLossLimit) {
      newStatus = 'Fail';
    } else if (newDrawdown >= config.maxDrawdown) {
      newStatus = 'Fail';
    } else if (currentPhase === 1 && newBalance >= config.startingBalance + config.phase1Target) {
      // Phase 1 complete, move to Phase 2
      newPhase = 2;
      newStatus = 'Ongoing';
    } else if (currentPhase === 2 && newBalance >= config.startingBalance + config.phase1Target + config.phase2Target) {
      // Phase 2 complete, challenge passed
      newStatus = 'Pass';
    }
    
    // Calculate next day's risk
    const nextRisk = calculateRiskAdjustment(dailyPL, currentRisk);
    
    // Save to Supabase
    try {
      const { error } = await supabase
        .from('trading_history')
        .insert({
          user_name: selectedUser,
          phase: currentPhase,
          day_number: dayNumber,
          wins,
          losses,
          risk_used: currentRisk,
          daily_pl: dailyPL,
          balance: newBalance,
          peak_balance: newPeakBalance,
          drawdown: newDrawdown,
          status: newStatus
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      alert('Failed to save trading data. Please try again.');
      return;
    }
    
    // Update state
    setBalance(newBalance);
    setPeakBalance(newPeakBalance);
    setCurrentRisk(nextRisk);
    setDailyPL(dailyPL);
    setStatus(newStatus);
    setDayNumber(dayNumber + 1);
    
    // Reload history
    loadTradingHistory();
  };

  const resetChallenge = () => {
    if (window.confirm('Are you sure you want to reset the challenge? This will clear all data.')) {
      setBalance(config.startingBalance);
      setPeakBalance(config.startingBalance);
      setCurrentRisk(config.initialRisk);
      setDayNumber(1);
      setCurrentPhase(1);
      setStatus('Ongoing');
      setDailyPL(0);
    }
  };

  const handleSwitchUser = () => {
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading challenge data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Dynamic Risk Calculator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your $6,000 prop firm challenge with Phase 1 (8%) and Phase 2 (5%) targets, automatic risk adjustments, and violation detection.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-sm text-gray-500">Day #{dayNumber} - Phase {currentPhase}</span>
            <button
              onClick={resetChallenge}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Reset Challenge
            </button>
          </div>
        </motion.div>

        <div className="space-y-8">
          <ConfigPanel 
            config={config} 
            currentPhase={currentPhase}
            userName={selectedUser}
            onConfigChange={setConfig} 
            onSwitchUser={handleSwitchUser}
          />
          
          <StatsPanel
            balance={balance}
            startingBalance={config.startingBalance}
            currentTarget={currentTarget}
            phase={currentPhase}
            peakBalance={peakBalance}
            drawdown={drawdown}
            maxDrawdown={config.maxDrawdown}
            dailyPL={dailyPL}
            status={status}
            nextRisk={currentRisk}
          />
          
          <TradingForm
            currentRisk={currentRisk}
            tradesPerDay={config.tradesPerDay}
            onSubmitTrades={handleSubmitTrades}
            disabled={status !== 'Ongoing'}
          />
          
          <HistoryTable history={history} />
        </div>
      </div>
    </div>
  );
}

export default App;