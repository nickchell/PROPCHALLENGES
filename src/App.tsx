import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, RefreshCw } from 'lucide-react';
import { UserSelector } from './components/UserSelector';
import { ConfigPanel } from './components/ConfigPanel';
import { WeeklyTradingGrid } from './components/WeeklyTradingGrid';
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
  const [weekNumber, setWeekNumber] = useLocalStorage<number>(`weekNumber_${selectedUser}`, 1);
  const [maxWeek, setMaxWeek] = useLocalStorage<number>(`maxWeek_${selectedUser}`, 1);
  const [currentPhase, setCurrentPhase] = useLocalStorage<number>(`currentPhase_${selectedUser}`, 1);
  const [status, setStatus] = useLocalStorage<'Ongoing' | 'Pass' | 'Fail'>(`status_${selectedUser}`, 'Ongoing');
  const [dailyPL, setDailyPL] = useState(0);
  const [history, setHistory] = useState<TradingHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhase1Complete, setShowPhase1Complete] = useState(false);
  const [currentWeekData, setCurrentWeekData] = useState<any[]>([]);

  // Load trading history on mount
  useEffect(() => {
    if (selectedUser) {
      loadTradingHistory();
      loadWeekData(weekNumber);
    }
  }, [selectedUser, weekNumber]);

  // Update peak balance when balance increases
  useEffect(() => {
    if (balance > peakBalance) {
      setPeakBalance(balance);
    }
  }, [balance, peakBalance, setPeakBalance]);

  // Show user selector if no user is selected
  if (!selectedUser) {
    return <UserSelector profiles={USER_PROFILES} onSelectUser={setSelectedUser} />;
  }

  const drawdown = Math.max(0, config.startingBalance - balance);
  const currentTarget = currentPhase === 1 ? config.phase1Target : config.phase2Target;

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

  const handleSubmitTrades = async (dayOfWeek: string, tradeAmounts: number[], tradeScreenshots: (string | null)[] = []) => {
    if (!selectedUser) return;
    
    // Calculate daily P/L from exact trade amounts
    const dailyPL = tradeAmounts.reduce((sum, amount) => sum + amount, 0);
    
    // Count wins and losses for display purposes
    const wins = tradeAmounts.filter(amount => amount > 0).length;
    const losses = tradeAmounts.filter(amount => amount < 0).length;
    
    // Update balance
    const newBalance = balance + dailyPL;
    const newPeakBalance = Math.max(peakBalance, newBalance);
    const newDrawdown = Math.max(0, config.startingBalance - newBalance);
    
    // Check for violations
    let newStatus: 'Ongoing' | 'Pass' | 'Fail' = 'Ongoing';
    
    if (dailyPL <= -config.dailyLossLimit) {
      newStatus = 'Fail';
    } else if (newDrawdown >= config.maxDrawdown) {
      newStatus = 'Fail';
    } else if (currentPhase === 1 && newBalance >= config.startingBalance + config.phase1Target) {
      // Phase 1 complete, show confirmation dialog
      setShowPhase1Complete(true);
      newStatus = 'Ongoing';
    } else if (currentPhase === 2 && newBalance >= config.startingBalance + config.phase1Target + config.phase2Target) {
      // Phase 2 complete, challenge passed
      newStatus = 'Pass';
    }
    
    // Calculate next day's risk
    const nextRisk = calculateRiskAdjustment(dailyPL, currentRisk);
    
    // Save to Supabase - both daily_trades and trading_history
    try {
      // Save to daily_trades table (upsert to handle duplicates)
      const { error: dailyError } = await supabase
        .from('daily_trades')
        .upsert({
          user_name: selectedUser,
          week_number: weekNumber,
          day_of_week: dayOfWeek,
          trade_amounts: tradeAmounts,
          trade_screenshots: tradeScreenshots,
          daily_pl: dailyPL,
          risk_used: currentRisk,
          phase: currentPhase,
          status: newStatus,
          balance_after: newBalance,
          drawdown_after: newDrawdown
        }, {
          onConflict: 'user_name,week_number,day_of_week'
        });

      if (dailyError) throw dailyError;

      // Save to trading_history table for summary
      const { error: historyError } = await supabase
        .from('trading_history')
        .insert({
          user_name: selectedUser,
          phase: currentPhase,
          day_number: dayNumber,
          week_number: weekNumber,
          wins,
          losses,
          trade_amounts: tradeAmounts,
          risk_used: currentRisk,
          daily_pl: dailyPL,
          balance: newBalance,
          peak_balance: newPeakBalance,
          drawdown: newDrawdown,
          status: newStatus
        });

      if (historyError) throw historyError;
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
    
    // Calculate the correct week number based on the new day number
    const daysInWeek = 5; // Monday to Friday
    const newDayNumber = dayNumber + 1;
    const correctWeekNumber = Math.ceil(newDayNumber / daysInWeek);
    
    // Update week number and max week
    setWeekNumber(correctWeekNumber);
    setMaxWeek(Math.max(maxWeek, correctWeekNumber));
    
    // Reload history
    loadTradingHistory();
  };

  const resetChallenge = () => {
    if (window.confirm('Are you sure you want to reset the challenge? This will clear all data.')) {
      setBalance(config.startingBalance);
      setPeakBalance(config.startingBalance);
      setCurrentRisk(config.initialRisk);
      setDayNumber(1);
      setWeekNumber(1);
      setMaxWeek(1);
      setCurrentPhase(1);
      setStatus('Ongoing');
      setDailyPL(0);
    }
  };

  const handleSwitchUser = () => {
    setSelectedUser(null);
  };

  const handleProceedToPhase2 = () => {
    setCurrentPhase(2);
    setShowPhase1Complete(false);
  };

  const handleStayInPhase1 = () => {
    setShowPhase1Complete(false);
  };

  const handleNextWeek = () => {
    const nextWeek = maxWeek + 1;
    setWeekNumber(nextWeek);
    setMaxWeek(nextWeek);
  };

  const handleWeekChange = (newWeek: number) => {
    if (newWeek >= 1 && newWeek <= maxWeek) {
      setWeekNumber(newWeek);
      // Always try to load data for the selected week
      loadWeekData(newWeek);
    }
  };

  const loadWeekData = async (week: number) => {
    if (!selectedUser) return;
    
    try {
      const { data, error } = await supabase
        .from('daily_trades')
        .select('*')
        .eq('user_name', selectedUser)
        .eq('week_number', week)
        .order('day_of_week');

      if (error) throw error;
      
      // Set the week data for the component to use
      console.log(`Week ${week} data loaded:`, data);
      setCurrentWeekData(data || []);
    } catch (error) {
      console.error('Error loading week data:', error);
      setCurrentWeekData([]);
    }
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dynamic Risk Calculator</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Track your $6,000 prop firm challenge with Phase 1 (8%) and Phase 2 (5%) targets, automatic risk adjustments, and violation detection.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-500">Week #{weekNumber} - Day #{dayNumber} - Phase {currentPhase}</span>
            <button
              onClick={resetChallenge}
              className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Reset Challenge
            </button>
          </div>
        </motion.div>

        <div className="space-y-6 sm:space-y-8">
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
          
          <WeeklyTradingGrid
            currentRisk={currentRisk}
            tradesPerDay={config.tradesPerDay}
            onSubmitTrades={handleSubmitTrades}
            disabled={status !== 'Ongoing'}
            currentWeek={weekNumber}
            onWeekChange={handleWeekChange}
            maxWeek={maxWeek}
            weekData={currentWeekData}
            onNextWeek={handleNextWeek}
          />
          
          <HistoryTable history={history} />
        </div>
      </div>

      {/* Phase 1 Completion Confirmation Dialog */}
      {showPhase1Complete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Phase 1 Complete! 🎉
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Congratulations! You've successfully completed Phase 1 by reaching your 8% target. 
                Would you like to proceed to Phase 2 (5% target) or stay in Phase 1?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleStayInPhase1}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Stay in Phase 1
                </button>
                <button
                  onClick={handleProceedToPhase2}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Proceed to Phase 2
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;