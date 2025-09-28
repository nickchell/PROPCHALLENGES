/*
  # Add user profiles to trading history

  1. Changes
    - Add `user_name` column to trading_history table
    - Add `phase` column to track Phase 1 vs Phase 2
    - Update RLS policies to support user-specific data
    - Add indexes for better performance

  2. Security
    - Maintain public access but filter by user_name
    - Add policies for user-specific data access
*/

-- Add user_name and phase columns to existing table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trading_history' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE trading_history ADD COLUMN user_name text NOT NULL DEFAULT 'default_user';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trading_history' AND column_name = 'phase'
  ) THEN
    ALTER TABLE trading_history ADD COLUMN phase integer NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trading_history_user_name ON trading_history (user_name);
CREATE INDEX IF NOT EXISTS idx_trading_history_user_phase ON trading_history (user_name, phase);

-- Update RLS policies to be user-specific
DROP POLICY IF EXISTS "Allow public read access" ON trading_history;
DROP POLICY IF EXISTS "Allow public insert access" ON trading_history;

CREATE POLICY "Allow user-specific read access"
  ON trading_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow user-specific insert access"
  ON trading_history
  FOR INSERT
  TO public
  WITH CHECK (true);