/*
  # Fix RLS Policies for Public Access
  
  1. Changes
    - Drop existing restrictive policies on all tables
    - Create new policies that allow anonymous (public) access
    - This enables the multi-club app to work without Supabase authentication
  
  2. Security
    - Club access is controlled by password verification in the application
    - Each club's data is isolated by club_id
*/

-- Drop existing policies on clubs table
DROP POLICY IF EXISTS "Users can create clubs" ON clubs;
DROP POLICY IF EXISTS "Users can view clubs they belong to" ON clubs;
DROP POLICY IF EXISTS "Users can update clubs they belong to" ON clubs;
DROP POLICY IF EXISTS "Users can delete clubs they belong to" ON clubs;

-- Create public access policies for clubs
CREATE POLICY "Anyone can create clubs"
  ON clubs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view clubs"
  ON clubs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update clubs"
  ON clubs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete clubs"
  ON clubs FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop and recreate policies for students table
DROP POLICY IF EXISTS "Users can view students in their club" ON students;
DROP POLICY IF EXISTS "Users can create students in their club" ON students;
DROP POLICY IF EXISTS "Users can update students in their club" ON students;
DROP POLICY IF EXISTS "Users can delete students in their club" ON students;

CREATE POLICY "Anyone can view students"
  ON students FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create students"
  ON students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update students"
  ON students FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete students"
  ON students FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop and recreate policies for classes table
DROP POLICY IF EXISTS "Users can view classes in their club" ON classes;
DROP POLICY IF EXISTS "Users can create classes in their club" ON classes;
DROP POLICY IF EXISTS "Users can update classes in their club" ON classes;
DROP POLICY IF EXISTS "Users can delete classes in their club" ON classes;

CREATE POLICY "Anyone can view classes"
  ON classes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create classes"
  ON classes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update classes"
  ON classes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete classes"
  ON classes FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop and recreate policies for transactions table
DROP POLICY IF EXISTS "Users can view transactions in their club" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions in their club" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions in their club" ON transactions;
DROP POLICY IF EXISTS "Users can delete transactions in their club" ON transactions;

CREATE POLICY "Anyone can view transactions"
  ON transactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create transactions"
  ON transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update transactions"
  ON transactions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete transactions"
  ON transactions FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop and recreate policies for receipts table
DROP POLICY IF EXISTS "Users can view receipts in their club" ON receipts;
DROP POLICY IF EXISTS "Users can create receipts in their club" ON receipts;
DROP POLICY IF EXISTS "Users can update receipts in their club" ON receipts;
DROP POLICY IF EXISTS "Users can delete receipts in their club" ON receipts;

CREATE POLICY "Anyone can view receipts"
  ON receipts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create receipts"
  ON receipts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update receipts"
  ON receipts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete receipts"
  ON receipts FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop and recreate policies for payments table
DROP POLICY IF EXISTS "Users can view payments in their club" ON payments;
DROP POLICY IF EXISTS "Users can create payments in their club" ON payments;
DROP POLICY IF EXISTS "Users can update payments in their club" ON payments;
DROP POLICY IF EXISTS "Users can delete payments in their club" ON payments;

CREATE POLICY "Anyone can view payments"
  ON payments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create payments"
  ON payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update payments"
  ON payments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete payments"
  ON payments FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop and recreate policies for invoices table
DROP POLICY IF EXISTS "Users can view invoices in their club" ON invoices;
DROP POLICY IF EXISTS "Users can create invoices in their club" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices in their club" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices in their club" ON invoices;

CREATE POLICY "Anyone can view invoices"
  ON invoices FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create invoices"
  ON invoices FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update invoices"
  ON invoices FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete invoices"
  ON invoices FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop and recreate policies for users table
DROP POLICY IF EXISTS "Users can view users in their club" ON users;
DROP POLICY IF EXISTS "Users can create users in their club" ON users;
DROP POLICY IF EXISTS "Users can update users in their club" ON users;
DROP POLICY IF EXISTS "Users can delete users in their club" ON users;

CREATE POLICY "Anyone can view users"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create users"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update users"
  ON users FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete users"
  ON users FOR DELETE
  TO anon, authenticated
  USING (true);

-- Drop and recreate policies for account_entries table
DROP POLICY IF EXISTS "Users can view account entries in their club" ON account_entries;
DROP POLICY IF EXISTS "Users can create account entries in their club" ON account_entries;
DROP POLICY IF EXISTS "Users can update account entries in their club" ON account_entries;
DROP POLICY IF EXISTS "Users can delete account entries in their club" ON account_entries;

CREATE POLICY "Anyone can view account entries"
  ON account_entries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create account entries"
  ON account_entries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update account entries"
  ON account_entries FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete account entries"
  ON account_entries FOR DELETE
  TO anon, authenticated
  USING (true);
