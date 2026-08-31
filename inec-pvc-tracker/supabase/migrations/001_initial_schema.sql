-- =====================================================
-- INEC PVC Tracker - Complete Database Schema
-- For Supabase PostgreSQL Database
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. LGA Reference Table
-- =====================================================
CREATE TABLE IF NOT EXISTS lga_reference (
  lga_code TEXT PRIMARY KEY,
  lga_name TEXT NOT NULL,
  state_code TEXT DEFAULT '27',
  total_wards INTEGER,
  total_pus INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. Ward Reference Table
-- =====================================================
CREATE TABLE IF NOT EXISTS ward_reference (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ward_code TEXT NOT NULL,
  ward_name TEXT NOT NULL,
  lga_code TEXT REFERENCES lga_reference(lga_code),
  full_delimitation TEXT,
  total_pus INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ward_code, lga_code)
);

-- =====================================================
-- 3. Polling Unit Reference Table
-- =====================================================
CREATE TABLE IF NOT EXISTS pu_reference (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pu_code TEXT NOT NULL,
  pu_name TEXT NOT NULL,
  ward_code TEXT NOT NULL,
  lga_code TEXT NOT NULL,
  full_delimitation TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. User Profiles (Officers and Admins)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- =====================================================
-- 5. PVC Distributions (Main Transaction Table)
-- =====================================================
CREATE TABLE IF NOT EXISTS pvc_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Voter Information
  vin TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('MALE', 'FEMALE')),
  occupation TEXT,
  residential_address TEXT,
  
  -- Registration Details (from back of card)
  date_of_registration DATE,
  batch_number TEXT,
  serial_number TEXT,
  
  -- Delimitation (from front of card)
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

-- =====================================================
-- 6. Daily Summary View (for performance)
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_pvc_summary AS
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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pvc_vin ON pvc_distributions(vin);
CREATE INDEX IF NOT EXISTS idx_pvc_issued_by ON pvc_distributions(issued_by);
CREATE INDEX IF NOT EXISTS idx_pvc_delimitation ON pvc_distributions(state_code, lga_code, ward_code, pu_code);
CREATE INDEX IF NOT EXISTS idx_pvc_issued_at ON pvc_distributions(issued_at);
CREATE INDEX IF NOT EXISTS idx_pvc_lga_date ON pvc_distributions(lga_code, issued_at);
CREATE INDEX IF NOT EXISTS idx_pvc_status ON pvc_distributions(status);
CREATE INDEX IF NOT EXISTS idx_pu_delimitation ON pu_reference(full_delimitation);
CREATE INDEX IF NOT EXISTS idx_ward_lga ON ward_reference(lga_code);
CREATE INDEX IF NOT EXISTS idx_pu_lga_ward ON pu_reference(lga_code, ward_code);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE pvc_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts on re-run)
DROP POLICY IF EXISTS officer_own_records ON pvc_distributions;
DROP POLICY IF EXISTS admin_all_records ON pvc_distributions;
DROP POLICY IF EXISTS officers_insert_own_records ON pvc_distributions;
DROP POLICY IF EXISTS officers_update_own_records ON pvc_distributions;
DROP POLICY IF EXISTS users_view_own_profile ON profiles;
DROP POLICY IF EXISTS users_insert_own_profile ON profiles;
DROP POLICY IF EXISTS users_update_own_profile ON profiles;
DROP POLICY IF EXISTS admins_view_all_profiles ON profiles;
DROP POLICY IF EXISTS admins_update_all_profiles ON profiles;

-- RLS Policies for Officers (can only see their own records)
CREATE POLICY officer_own_records ON pvc_distributions
  FOR SELECT USING (issued_by = auth.uid());

-- RLS Policies for Admins (can see all records)
CREATE POLICY admin_all_records ON pvc_distributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Allow officers to insert their own PVC distribution records
CREATE POLICY officers_insert_own_records ON pvc_distributions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow officers to update their own PVC distribution records
CREATE POLICY officers_update_own_records ON pvc_distributions
  FOR UPDATE USING (issued_by = auth.uid());

-- RLS Policies for Profiles
CREATE POLICY users_view_own_profile ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY users_insert_own_profile ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY users_update_own_profile ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY admins_view_all_profiles ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY admins_update_all_profiles ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- FUNCTIONS FOR AGGREGATION
-- =====================================================
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

-- =====================================================
-- TRIGGER: Auto-refresh materialized view on PVC insert/update
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_daily_pvc_summary()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_pvc_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (if it doesn't exist)
DROP TRIGGER IF EXISTS trigger_refresh_pvc_summary ON pvc_distributions;
CREATE TRIGGER trigger_refresh_pvc_summary
  AFTER INSERT OR UPDATE OR DELETE ON pvc_distributions
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_daily_pvc_summary();

-- =====================================================
-- SEED DATA: Ogun State LGAs
-- =====================================================
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
('20', 'Ogun East', 12, 200)
ON CONFLICT (lga_code) DO NOTHING;

-- =====================================================
-- SEED DATA: Sagamu Wards (LGA 18)
-- =====================================================
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
('15', 'Ibindo/Ituwa/Alara', '18', '27/18/15', 9)
ON CONFLICT (ward_code, lga_code) DO NOTHING;

-- =====================================================
-- ENABLE REALTIME FOR ALL TABLES
-- This is critical for real-time synchronization
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS pvc_distributions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS lga_reference;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS ward_reference;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS pu_reference;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE lga_reference IS 'Local Government Area reference data for Ogun State';
COMMENT ON TABLE ward_reference IS 'Ward reference data linked to LGAs';
COMMENT ON TABLE pu_reference IS 'Polling Unit reference data linked to Wards and LGAs';
COMMENT ON TABLE profiles IS 'User profiles for officers and administrators';
COMMENT ON TABLE pvc_distributions IS 'PVC distribution transaction records';
COMMENT ON MATERIALIZED VIEW daily_pvc_summary IS 'Daily aggregated summary of PVC distributions';
COMMENT ON FUNCTION get_pvc_stats_by_hierarchy IS 'Returns PVC statistics filtered by hierarchical location and date range';
