# Supabase Configuration for INEC PVC Tracker

## Environment Setup

1. **Create a `.env` file** in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. **Get your credentials from Supabase:**
   - Go to https://supabase.com
   - Select your project (or create a new one)
   - Navigate to Settings → API
   - Copy the Project URL and anon/public key

## Database Setup

### Option 1: Run SQL in Supabase SQL Editor

Copy and paste the entire SQL script below into the Supabase SQL Editor and run it.

### Option 2: Use the Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

## Complete Database Schema SQL

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LGA Reference Table
CREATE TABLE lga_reference (
  lga_code TEXT PRIMARY KEY,
  lga_name TEXT NOT NULL,
  state_code TEXT DEFAULT '27',
  total_wards INTEGER,
  total_pus INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Ward Reference Table
CREATE TABLE ward_reference (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ward_code TEXT NOT NULL,
  ward_name TEXT NOT NULL,
  lga_code TEXT REFERENCES lga_reference(lga_code),
  full_delimitation TEXT,
  total_pus INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ward_code, lga_code)
);

-- 3. Polling Unit Reference Table
CREATE TABLE pu_reference (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pu_code TEXT NOT NULL,
  pu_name TEXT NOT NULL,
  ward_code TEXT NOT NULL,
  lga_code TEXT NOT NULL,
  full_delimitation TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. User Profiles (Officers and Admins)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('officer', 'admin', 'super_admin')) NOT NULL,
  assigned_lga_code TEXT REFERENCES lga_reference(lga_code),
  assigned_ward_code TEXT,
  phone_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. PVC Distributions (Main Transaction Table)
CREATE TABLE pvc_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Voter Information
  vin TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE')),
  occupation TEXT,
  residential_address TEXT,
  
  -- Registration Details
  date_of_registration DATE,
  batch_number TEXT,
  serial_number TEXT,
  
  -- Delimitation
  delimitation_full TEXT NOT NULL,
  state_code TEXT NOT NULL DEFAULT '27',
  lga_code TEXT NOT NULL,
  ward_code TEXT NOT NULL,
  pu_code TEXT NOT NULL,
  
  -- Foreign key references
  pu_id UUID REFERENCES pu_reference(id),
  
  -- Distribution Details
  issued_by UUID REFERENCES profiles(id),
  issued_by_name TEXT NOT NULL,
  issued_by_lga_code TEXT,
  issued_at TIMESTAMP DEFAULT NOW(),
  
  -- Scan Method
  scan_method TEXT CHECK (scan_method IN ('qr_only', 'ocr_only', 'dual_scan', 'manual')),
  
  -- Status
  status TEXT CHECK (status IN ('issued', 'pending', 'cancelled')) DEFAULT 'issued',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Daily Summary View
CREATE MATERIALIZED VIEW daily_pvc_summary AS
SELECT 
  DATE(issued_at) as distribution_date,
  state_code,
  lga_code,
  ward_code,
  pu_code,
  COUNT(*) as total_issued,
  COUNT(DISTINCT issued_by) as total_officers,
  COUNT(CASE WHEN scan_method = 'dual_scan' THEN 1 END) as dual_scans,
  COUNT(CASE WHEN scan_method = 'manual' THEN 1 END) as manual_entries
FROM pvc_distributions
WHERE status = 'issued'
GROUP BY DATE(issued_at), state_code, lga_code, ward_code, pu_code;

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_pvc_vin ON pvc_distributions(vin);
CREATE INDEX idx_pvc_issued_by ON pvc_distributions(issued_by);
CREATE INDEX idx_pvc_delimitation ON pvc_distributions(state_code, lga_code, ward_code, pu_code);
CREATE INDEX idx_pvc_issued_at ON pvc_distributions(issued_at);
CREATE INDEX idx_pvc_lga_date ON pvc_distributions(lga_code, issued_at);
CREATE INDEX idx_pvc_status ON pvc_distributions(status);
CREATE INDEX idx_pu_delimitation ON pu_reference(full_delimitation);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE pvc_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Officers
CREATE POLICY officer_own_records ON pvc_distributions
  FOR SELECT USING (issued_by = auth.uid());

-- RLS Policies for Admins
CREATE POLICY admin_all_records ON pvc_distributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function for Aggregation
CREATE OR REPLACE FUNCTION get_pvc_stats_by_hierarchy(
  p_state_code TEXT DEFAULT '27',
  p_lga_code TEXT DEFAULT NULL,
  p_ward_code TEXT DEFAULT NULL,
  p_start_date TIMESTAMP DEFAULT NULL,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  lga_code TEXT,
  lga_name TEXT,
  ward_code TEXT,
  ward_name TEXT,
  pu_code TEXT,
  pu_name TEXT,
  total_issued BIGINT,
  date_range DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.lga_code,
    l.lga_name,
    d.ward_code,
    w.ward_name,
    d.pu_code,
    p.pu_name,
    COUNT(*)::BIGINT as total_issued,
    DATE(d.issued_at) as date_range
  FROM pvc_distributions d
  LEFT JOIN lga_reference l ON d.lga_code = l.lga_code
  LEFT JOIN ward_reference w ON d.ward_code = w.ward_code AND d.lga_code = w.lga_code
  LEFT JOIN pu_reference p ON d.pu_code = p.pu_code AND d.ward_code = p.ward_code AND d.lga_code = p.lga_code
  WHERE d.state_code = COALESCE(p_state_code, d.state_code)
    AND (p_lga_code IS NULL OR d.lga_code = p_lga_code)
    AND (p_ward_code IS NULL OR d.ward_code = p_ward_code)
    AND (p_start_date IS NULL OR d.issued_at >= p_start_date)
    AND (p_end_date IS NULL OR d.issued_at <= p_end_date)
    AND d.status = 'issued'
  GROUP BY 
    d.lga_code, l.lga_name,
    d.ward_code, w.ward_name,
    d.pu_code, p.pu_name,
    DATE(d.issued_at)
  ORDER BY 
    d.lga_code, d.ward_code, d.pu_code, date_range;
END;
$$;

-- SEED DATA: Ogun State LGAs
INSERT INTO lga_reference (lga_code, lga_name, total_wards, total_pus) VALUES
('01', 'Abeokuta North', 16, 335),
('02', 'Abeokuta South', 15, 209),
('03', 'Ado-Odo/Ota', 16, 257),
('04', 'Ewekoro', 10, 188),
('05', 'Ifo', 12, 182),
('06', 'Ijebu East', 15, 109),
('07', 'Ijebu North', 11, 448),
('08', 'Ijebu North-East', 16, 161),
('09', 'Ijebu Ode', 11, 268),
('10', 'Ikene', 11, 161),
('11', 'Ipokia', 12, 262),
('12', 'Obafemi Owode', 15, 329),
('13', 'Odeda', 11, 178),
('14', 'Ogun Waterside', 16, 126),
('15', 'Odogbolu', 13, 132),
('16', 'Ogijo/Likosi', 10, 56),
('17', 'Remo North', 12, 132),
('18', 'Shagamu', 15, 299),
('19', 'Imeko Afon', 10, 132),
('20', 'Ogun East', 12, 200);

-- SEED DATA: Sagamu Wards (LGA 18)
INSERT INTO ward_reference (ward_code, ward_name, lga_code, full_delimitation, total_pus) VALUES
('01', 'Oko/Ope/Itula I', '18', '27/18/01', 11),
('02', 'Oko/Ope/Itula II', '18', '27/18/02', 17),
('03', 'Ayegbami/Jokun', '18', '27/18/03', 15),
('04', 'Sabo I', '18', '27/18/04', 34),
('05', 'Sabo II', '18', '27/18/05', 30),
('06', 'Isokun/Oyebajo', '18', '27/18/06', 14),
('07', 'Ljagba', '18', '27/18/07', 9),
('08', 'Latawa', '18', '27/18/08', 8),
('09', 'Ode-Lemo', '18', '27/18/09', 12),
('10', 'Ogijo/Likosi', '18', '27/18/10', 56),
('11', 'Surulere', '18', '27/18/11', 18),
('12', 'Isote', '18', '27/18/12', 8),
('13', 'Simawa/Iwelepe', '18', '27/18/13', 25),
('14', 'Agbowa', '18', '27/18/14', 29),
('15', 'Ibindo/Ituwa/Alara', '18', '27/18/15', 9);

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE pvc_distributions;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE lga_reference;
ALTER PUBLICATION supabase_realtime ADD TABLE ward_reference;
ALTER PUBLICATION supabase_realtime ADD TABLE pu_reference;
```

## Post-Setup Verification

After running the SQL script, verify the setup:

1. **Check Tables**: Navigate to Table Editor in Supabase dashboard
2. **Check Data**: Verify LGAs and Wards are populated
3. **Test Realtime**: Ensure realtime is enabled for all tables
4. **Test RLS**: Create a test user and verify access policies

## Usage in Application

The application will automatically connect to Supabase when you:

1. Set the environment variables in `.env`
2. Restart the development server: `npm run dev`
3. The app will sync data in real-time with your Supabase database

## Key Features

- ✅ **Real-time synchronization** for PVC distributions
- ✅ **Hierarchical data structure** (State → LGA → Ward → PU)
- ✅ **Row Level Security** for data access control
- ✅ **Automatic statistics aggregation** via database functions
- ✅ **Daily summary materialized view** for performance
- ✅ **Complete audit trail** with timestamps
