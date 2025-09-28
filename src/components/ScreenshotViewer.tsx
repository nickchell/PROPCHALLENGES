import React from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface ScreenshotViewerProps {
  isOpen: boolean;
  onClose: () => void;
  screenshots: (string | null)[];
  dayOfWeek: string;
  tradeAmounts: number[];
}

export const ScreenshotViewer: React.FC<ScreenshotViewerProps> = ({
  isOpen,
  onClose,
  screenshots,
  dayOfWeek,
  tradeAmounts
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Filter out null screenshots and get their indices
  const validScreenshots = screenshots
    .map((url, index) => ({ url, index, amount: tradeAmounts[index] }))
    .filter(item => item.url !== null);

  console.log('ScreenshotViewer opened with:', { screenshots, validScreenshots, dayOfWeek });

  const currentScreenshot = validScreenshots[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(prev => 
      prev > 0 ? prev - 1 : validScreenshots.length - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(prev => 
      prev < validScreenshots.length - 1 ? prev + 1 : 0
    );
  };

  const handleDownload = () => {
    if (currentScreenshot?.url) {
      const link = document.createElement('a');
      link.href = currentScreenshot.url;
      link.download = `${dayOfWeek}_Trade_${currentScreenshot.index + 1}_screenshot.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (validScreenshots.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Screenshots Available
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              No screenshots were uploaded for {dayOfWeek}.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-2 sm:mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {dayOfWeek} - Trade Screenshots
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {validScreenshots.length} screenshot{validScreenshots.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Screenshot Display */}
        <div className="relative p-2 sm:p-4">
          {currentScreenshot && (
            <div className="text-center">
              {/* Trade Info */}
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Trade {currentScreenshot.index + 1}
                  </span>
                  <span className={`text-xs sm:text-sm font-semibold ${
                    currentScreenshot.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currentScreenshot.amount >= 0 ? '+' : ''}${currentScreenshot.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Screenshot Image */}
              <div className="relative max-h-[50vh] sm:max-h-[60vh] overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={currentScreenshot.url}
                  alt={`Trade ${currentScreenshot.index + 1} screenshot`}
                  className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        {validScreenshots.length > 1 && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-500">
                {currentIndex + 1} of {validScreenshots.length}
              </span>
              <div className="flex gap-1">
                {validScreenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Download Button */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Screenshot</span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
