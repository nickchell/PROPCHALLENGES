/*
  # Add screenshot support to daily_trades

  1. Changes
    - Add `screenshot_url` column to daily_trades table
    - Support for storing screenshot URLs

  2. Security
    - Maintain existing RLS policies
    - Add index for better performance
*/

-- Add trade_screenshots column to daily_trades table (JSONB array for multiple screenshots)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_trades' AND column_name = 'trade_screenshots'
  ) THEN
    ALTER TABLE daily_trades ADD COLUMN trade_screenshots jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_daily_trades_trade_screenshots ON daily_trades USING GIN (trade_screenshots);
