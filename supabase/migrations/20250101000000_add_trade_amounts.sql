/*
  # Add trade_amounts column to trading_history

  1. Changes
    - Add `trade_amounts` column as JSONB array to store individual trade P/L amounts
    - This allows for more accurate tracking of exact trade results

  2. Security
    - Maintain existing RLS policies
    - JSONB column supports efficient querying and indexing
*/

-- Add trade_amounts column to existing table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trading_history' AND column_name = 'trade_amounts'
  ) THEN
    ALTER TABLE trading_history ADD COLUMN trade_amounts jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add index for better performance on trade_amounts queries
CREATE INDEX IF NOT EXISTS idx_trading_history_trade_amounts ON trading_history USING GIN (trade_amounts);
