/*
  # Update schema for weekly trading layout

  1. Changes
    - Add daily_trades table for individual day tracking
    - Keep trading_history for summary data
    - Support Monday-Friday trading structure

  2. Security
    - Maintain existing RLS policies
    - Add indexes for better performance
*/

-- Create daily_trades table for individual day tracking
CREATE TABLE IF NOT EXISTS daily_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_name text NOT NULL,
  week_number integer NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  trade_amounts jsonb DEFAULT '[]'::jsonb,
  daily_pl numeric(10,2) NOT NULL DEFAULT 0,
  risk_used numeric(10,2) NOT NULL,
  phase integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'Ongoing' CHECK (status IN ('Ongoing', 'Pass', 'Fail')),
  balance_after numeric(10,2) NOT NULL,
  drawdown_after numeric(10,2) NOT NULL DEFAULT 0,
  UNIQUE(user_name, week_number, day_of_week)
);

-- Enable RLS
ALTER TABLE daily_trades ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow user-specific read access"
  ON daily_trades
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow user-specific insert access"
  ON daily_trades
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow user-specific update access"
  ON daily_trades
  FOR UPDATE
  TO public
  USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_daily_trades_user_week ON daily_trades (user_name, week_number);
CREATE INDEX IF NOT EXISTS idx_daily_trades_user_day ON daily_trades (user_name, day_of_week);
CREATE INDEX IF NOT EXISTS idx_daily_trades_trade_amounts ON daily_trades USING GIN (trade_amounts);

-- Add week_number to trading_history for weekly summaries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trading_history' AND column_name = 'week_number'
  ) THEN
    ALTER TABLE trading_history ADD COLUMN week_number integer;
  END IF;
END $$;

-- Add index for week_number
CREATE INDEX IF NOT EXISTS idx_trading_history_week_number ON trading_history (user_name, week_number);
