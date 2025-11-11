-- Drop existing tables if recreating
DROP TABLE IF EXISTS payment_tracking CASCADE;
DROP TABLE IF EXISTS recurring_bills CASCADE;
DROP TABLE IF EXISTS property_expenses CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- Rental Properties (UPDATED with ROI fields)
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  monthly_rent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  property_management_percent DECIMAL(5, 2) DEFAULT 10.00,
  extra_monthly_expenses DECIMAL(10, 2) DEFAULT 0.00,
  hoa_fee DECIMAL(10, 2) DEFAULT 0.00,
  is_paid_off BOOLEAN DEFAULT FALSE,
  is_rental BOOLEAN DEFAULT TRUE,
  purchase_price DECIMAL(10, 2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add column comments
COMMENT ON COLUMN properties.purchase_price IS 'Original purchase price for ROI calculations';
COMMENT ON COLUMN properties.is_rental IS 'TRUE for rental properties, FALSE for primary residence';

-- Recurring Bills (taxes, insurance, etc.)
CREATE TABLE recurring_bills (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  frequency VARCHAR(50) NOT NULL, -- 'monthly', 'annual', 'quarterly', 'semi-annual'
  due_month INTEGER, -- 1-12, for annual bills like taxes
  category VARCHAR(100), -- 'taxes', 'insurance', 'hoa', 'utilities', 'mortgage', 'other'
  payment_link TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_one_time BOOLEAN DEFAULT FALSE, -- TRUE for repairs that shouldn't repeat
  one_time_year INTEGER, -- Year this one-time expense applies to
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property-specific expenses (lawn care, pool, etc.)
CREATE TABLE property_expenses (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  frequency VARCHAR(50) DEFAULT 'monthly', -- 'monthly', 'annual', 'quarterly', 'one-time'
  category VARCHAR(100), -- 'lawn_care', 'pool', 'maintenance', 'repairs', 'other'
  payment_link TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Tracking (for checking off monthly bills)
CREATE TABLE payment_tracking (
  id SERIAL PRIMARY KEY,
  bill_type VARCHAR(50) NOT NULL, -- 'mortgage', 'recurring_bill', 'property_expense'
  bill_id INTEGER NOT NULL, -- references the ID from the respective table
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  payment_month INTEGER NOT NULL, -- 1-12
  payment_year INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  amount_paid DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bill_type, bill_id, payment_month, payment_year)
);

-- Indexes for better performance
CREATE INDEX idx_recurring_bills_property ON recurring_bills(property_id);
CREATE INDEX idx_property_expenses_property ON property_expenses(property_id);
CREATE INDEX idx_payment_tracking_month_year ON payment_tracking(payment_month, payment_year);
CREATE INDEX idx_payment_tracking_property ON payment_tracking(property_id);
CREATE INDEX idx_properties_is_rental ON properties(is_rental);

-- Sample data (optional - remove if you don't want)
-- INSERT INTO properties (name, address, monthly_rent, property_management_percent, hoa_fee, is_paid_off, is_rental, purchase_price) 
-- VALUES 
--   ('123 Main St', '123 Main St, Miami, FL', 2500.00, 10.00, 0.00, false, true, 250000.00),
--   ('456 Oak Ave', '456 Oak Ave, Tampa, FL', 2000.00, 10.00, 150.00, false, true, 200000.00),
--   ('My Home', '789 Pine Rd, Orlando, FL', 0.00, 0.00, 0.00, false, false, 350000.00);

ALTER TABLE recurring_bills 
ADD COLUMN IF NOT EXISTS escrow_amount DECIMAL(10, 2) DEFAULT 0.00;

-- Add comment for documentation
COMMENT ON COLUMN recurring_bills.escrow_amount IS 'Escrowed taxes and insurance amount (for mortgages) - this amount will still be owed after payoff';
