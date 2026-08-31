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

### Option 1: Run SQL in Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, navigate to **SQL Editor**
2. Click **New Query**
3. Copy the entire content of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the script

The script will:
- ✅ Create all required tables (lga_reference, ward_reference, pu_reference, profiles, pvc_distributions)
- ✅ Create indexes for performance
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create aggregation functions
- ✅ Create a materialized view for daily summaries
- ✅ Enable real-time replication for all tables
- ✅ Seed initial data for Ogun State LGAs and Sagamu wards

### Option 2: Use the Supabase CLI

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (replace with your project ID)
supabase link --project-ref your-project-id

# Push migrations
supabase db push
```

## Complete Database Schema SQL

The complete schema is available in `supabase/migrations/001_initial_schema.sql`. Key features include:

### Tables Created

1. **lga_reference** - Local Government Area reference data
2. **ward_reference** - Ward reference data linked to LGAs
3. **pu_reference** - Polling Unit reference data linked to Wards and LGAs
4. **profiles** - User profiles for officers and administrators
5. **pvc_distributions** - PVC distribution transaction records

### Views

- **daily_pvc_summary** - Materialized view with daily aggregated statistics

### Functions

- **get_pvc_stats_by_hierarchy()** - Returns PVC statistics filtered by location and date range
- **refresh_daily_pvc_summary()** - Auto-refreshes the materialized view on changes

### Security Features

- Row Level Security (RLS) enabled on `pvc_distributions` and `profiles`
- Policies for officers (own records only) and admins (all records)
- Realtime replication enabled for all tables

### Seed Data

- 20 LGAs for Ogun State
- 15 Wards for Shagamu LGA

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
