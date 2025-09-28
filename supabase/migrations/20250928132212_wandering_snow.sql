/*
  # Create trading history table

  1. New Tables
    - `trading_history`
      - `id` (uuid, primary key)
      - `created_at` (timestamp, default now())
      - `day_number` (int)
      - `wins` (int)
      - `losses` (int)
      - `risk_used` (numeric)
      - `daily_pl` (numeric)
      - `balance` (numeric)
      - `peak_balance` (numeric)
      - `drawdown` (numeric)
      - `status` (text: "Ongoing", "Pass", "Fail")

  2. Security
    - Enable RLS on `trading_history` table
    - Add policy for public read/write access (no auth required)
*/

CREATE TABLE IF NOT EXISTS trading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  day_number int NOT NULL,
  wins int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  risk_used numeric(10,2) NOT NULL,
  daily_pl numeric(10,2) NOT NULL,
  balance numeric(10,2) NOT NULL,
  peak_balance numeric(10,2) NOT NULL,
  drawdown numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Ongoing'
);

ALTER TABLE trading_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON trading_history
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access"
  ON trading_history
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_trading_history_created_at ON trading_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_history_day_number ON trading_history(day_number);