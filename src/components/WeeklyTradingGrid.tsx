import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Camera, X, Eye } from 'lucide-react';
import { ScreenshotViewer } from './ScreenshotViewer';

interface WeeklyTradingGridProps {
  currentRisk: number;
  tradesPerDay: number;
  onSubmitTrades: (dayOfWeek: string, tradeAmounts: number[], tradeScreenshots?: (string | null)[]) => void;
  disabled: boolean;
  currentWeek: number;
  onWeekChange: (week: number) => void;
  maxWeek: number;
  weekData?: any[];
  onNextWeek: () => void;
}

interface DayData {
  dayOfWeek: string;
  tradeAmounts: number[];
  dailyPL: number;
  isSubmitted: boolean;
  tradeScreenshots: (File | null)[];
  tradeScreenshotUrls: (string | null)[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const WeeklyTradingGrid: React.FC<WeeklyTradingGridProps> = ({
  currentRisk,
  tradesPerDay,
  onSubmitTrades,
  disabled,
  currentWeek,
  onWeekChange,
  maxWeek,
  weekData = [],
  onNextWeek
}) => {
  const [screenshotViewer, setScreenshotViewer] = useState<{
    isOpen: boolean;
    dayOfWeek: string;
    screenshots: (string | null)[];
    tradeAmounts: number[];
  }>({
    isOpen: false,
    dayOfWeek: '',
    screenshots: [],
    tradeAmounts: []
  });

  const [dayData, setDayData] = useState<Record<string, DayData>>(() => {
    const initialData: Record<string, DayData> = {};
    DAYS_OF_WEEK.forEach(day => {
      initialData[day] = {
        dayOfWeek: day,
        tradeAmounts: new Array(tradesPerDay).fill(0),
        dailyPL: 0,
        isSubmitted: false,
        tradeScreenshots: new Array(tradesPerDay).fill(null),
        tradeScreenshotUrls: new Array(tradesPerDay).fill(null)
      };
    });
    return initialData;
  });

  // Load week data when week changes or weekData changes
  React.useEffect(() => {
    console.log(`Loading week ${currentWeek} data:`, weekData);
    const newDayData: Record<string, DayData> = {};
    
    DAYS_OF_WEEK.forEach(day => {
      // Check if we have saved data for this day
      const savedDayData = weekData.find(d => d.day_of_week === day);
      
      if (savedDayData) {
        // Load saved data
        console.log(`Loading saved data for ${day}:`, savedDayData);
        newDayData[day] = {
          dayOfWeek: day,
          tradeAmounts: savedDayData.trade_amounts || new Array(tradesPerDay).fill(0),
          dailyPL: savedDayData.daily_pl || 0,
          isSubmitted: true,
          tradeScreenshots: new Array(tradesPerDay).fill(null),
          tradeScreenshotUrls: savedDayData.trade_screenshots || new Array(tradesPerDay).fill(null)
        };
      } else {
        // Start with blank data
        console.log(`No saved data for ${day}, starting blank`);
        newDayData[day] = {
          dayOfWeek: day,
          tradeAmounts: new Array(tradesPerDay).fill(0),
          dailyPL: 0,
          isSubmitted: false,
          tradeScreenshots: new Array(tradesPerDay).fill(null),
          tradeScreenshotUrls: new Array(tradesPerDay).fill(null)
        };
      }
    });
    
    console.log('Final day data:', newDayData);
    setDayData(newDayData);
  }, [currentWeek, tradesPerDay, weekData]);

  const handleTradeAmountChange = (dayOfWeek: string, index: number, value: string) => {
    const newAmounts = [...dayData[dayOfWeek].tradeAmounts];
    newAmounts[index] = parseFloat(value) || 0;
    const dailyPL = newAmounts.reduce((sum, amount) => sum + amount, 0);
    
    setDayData(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        tradeAmounts: newAmounts,
        dailyPL
      }
    }));
  };

  const handleTradeScreenshotChange = (dayOfWeek: string, tradeIndex: number, file: File | null) => {
    setDayData(prev => {
      const newScreenshots = [...prev[dayOfWeek].tradeScreenshots];
      newScreenshots[tradeIndex] = file;
      return {
        ...prev,
        [dayOfWeek]: {
          ...prev[dayOfWeek],
          tradeScreenshots: newScreenshots
        }
      };
    });
  };

  const handleSubmitDay = async (dayOfWeek: string) => {
    const day = dayData[dayOfWeek];
    
    // Convert File objects to data URLs
    const screenshotUrls: (string | null)[] = [];
    for (let i = 0; i < day.tradeScreenshots.length; i++) {
      const file = day.tradeScreenshots[i];
      if (file) {
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          screenshotUrls[i] = dataUrl;
        } catch (error) {
          console.error('Error converting file to data URL:', error);
          screenshotUrls[i] = null;
        }
      } else {
        screenshotUrls[i] = day.tradeScreenshotUrls[i] || null;
      }
    }
    
    // Allow submission even with 0 values (no trades taken)
    onSubmitTrades(dayOfWeek, day.tradeAmounts, screenshotUrls);
    setDayData(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        isSubmitted: true,
        tradeScreenshotUrls: screenshotUrls
      }
    }));
  };

  const handleViewScreenshots = (dayOfWeek: string) => {
    const day = dayData[dayOfWeek];
    console.log('Opening screenshots for', dayOfWeek, ':', day.tradeScreenshotUrls);
    setScreenshotViewer({
      isOpen: true,
      dayOfWeek,
      screenshots: day.tradeScreenshotUrls,
      tradeAmounts: day.tradeAmounts
    });
  };

  const closeScreenshotViewer = () => {
    setScreenshotViewer(prev => ({ ...prev, isOpen: false }));
  };

  const getDayColor = (day: DayData) => {
    if (day.isSubmitted) {
      return day.dailyPL > 0 ? 'bg-green-50 border-green-200' : 
             day.dailyPL < 0 ? 'bg-red-50 border-red-200' : 
             'bg-gray-50 border-gray-200';
    }
    return 'bg-white border-gray-200';
  };

  const getDayTextColor = (day: DayData) => {
    if (day.isSubmitted) {
      return day.dailyPL > 0 ? 'text-green-700' : 
             day.dailyPL < 0 ? 'text-red-700' : 
             'text-gray-700';
    }
    return 'text-gray-900';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Week {currentWeek} Trading</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:ml-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onWeekChange(currentWeek - 1)}
              disabled={currentWeek <= 1}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="text-xs sm:text-sm text-gray-500">
              Week {currentWeek} of {maxWeek}
            </span>
            <button
              onClick={() => onWeekChange(currentWeek + 1)}
              disabled={currentWeek >= maxWeek}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
            <button
              onClick={onNextWeek}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              + New
            </button>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Risk: ${currentRisk.toFixed(2)} per trade
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {DAYS_OF_WEEK.map((dayOfWeek) => {
          const day = dayData[dayOfWeek];
          const allTradesEntered = day.tradeAmounts.every(amount => amount !== 0);
          
          return (
            <motion.div
              key={dayOfWeek}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: DAYS_OF_WEEK.indexOf(dayOfWeek) * 0.1 }}
              className={`rounded-lg border-2 p-3 sm:p-4 transition-all duration-200 ${getDayColor(day)}`}
            >
              <div className="text-center mb-4">
                <h3 className={`font-semibold text-base sm:text-lg ${getDayTextColor(day)}`}>
                  {dayOfWeek}
                </h3>
                {day.isSubmitted && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {day.dailyPL > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : day.dailyPL < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-gray-600" />
                    )}
                    <span className={`text-sm font-medium ${getDayTextColor(day)}`}>
                      {day.dailyPL >= 0 ? '+' : ''}${day.dailyPL.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {!day.isSubmitted && (
                <div className="space-y-2 sm:space-y-3">
                  {day.tradeAmounts.map((amount, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Trade {index + 1}
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={amount === 0 ? '' : amount}
                          onChange={(e) => handleTradeAmountChange(dayOfWeek, index, e.target.value)}
                          disabled={disabled}
                          placeholder="0.00"
                          className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                      
                      {/* Trade Screenshot */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleTradeScreenshotChange(dayOfWeek, index, e.target.files?.[0] || null)}
                          disabled={disabled}
                          className="hidden"
                          id={`screenshot-${dayOfWeek}-${index}`}
                        />
                        <label
                          htmlFor={`screenshot-${dayOfWeek}-${index}`}
                          className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Camera className="w-3 h-3" />
                          <span className="hidden sm:inline">{day.tradeScreenshots[index] ? 'Change' : 'Add'}</span>
                          <span className="sm:hidden">{day.tradeScreenshots[index] ? '✏️' : '📷'}</span>
                        </label>
                        {day.tradeScreenshots[index] && (
                          <button
                            onClick={() => handleTradeScreenshotChange(dayOfWeek, index, null)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {day.tradeScreenshots[index] && (
                        <p className="text-xs text-gray-500">
                          {day.tradeScreenshots[index]?.name}
                        </p>
                      )}
                    </div>
                  ))}


                  <button
                    onClick={() => handleSubmitDay(dayOfWeek)}
                    disabled={disabled}
                    className="w-full mt-3 sm:mt-4 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Day
                  </button>
                </div>
              )}

              {day.isSubmitted && (
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Completed</div>
                  
                  {/* View Screenshots Button */}
                  {day.tradeScreenshotUrls.some(url => url !== null) && (
                    <button
                      onClick={() => handleViewScreenshots(dayOfWeek)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors mb-2 sm:mb-3 mx-auto"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">View Screenshots</span>
                      <span className="sm:hidden">View</span>
                    </button>
                  )}
                  
                  <div className="space-y-2">
                    {day.tradeAmounts.map((amount, index) => (
                      <div key={index}>
                        <div className={`text-xs ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          T{index + 1}: {amount >= 0 ? '+' : ''}${amount.toFixed(2)}
                        </div>
                        {day.tradeScreenshotUrls[index] && (
                          <div className="mt-1">
                            <img 
                              src={day.tradeScreenshotUrls[index]!} 
                              alt={`Trade ${index + 1} screenshot`} 
                              className="w-full h-12 sm:h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handleViewScreenshots(dayOfWeek)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Days Completed: {Object.values(dayData).filter(day => day.isSubmitted).length} / 5
          </div>
          <div className="text-sm text-gray-600">
            Weekly P/L: 
            <span className={`font-semibold ml-1 ${
              Object.values(dayData).reduce((sum, day) => sum + day.dailyPL, 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {Object.values(dayData).reduce((sum, day) => sum + day.dailyPL, 0) >= 0 ? '+' : ''}
              ${Object.values(dayData).reduce((sum, day) => sum + day.dailyPL, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Screenshot Viewer Modal */}
      <ScreenshotViewer
        isOpen={screenshotViewer.isOpen}
        onClose={closeScreenshotViewer}
        screenshots={screenshotViewer.screenshots}
        dayOfWeek={screenshotViewer.dayOfWeek}
        tradeAmounts={screenshotViewer.tradeAmounts}
      />
    </motion.div>
  );
};
