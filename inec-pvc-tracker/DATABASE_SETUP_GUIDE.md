# Supabase Database Setup Guide

## Quick Start

This guide will help you connect your INEC PVC Tracker app to your Supabase account and set up the required database tables for real-time synchronization.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com and log in
2. Select your project (or create a new one)
3. Navigate to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (found under Project API keys)

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory of the project:

```bash
cd /workspace/inec-pvc-tracker
cp .env.example .env
```

Edit the `.env` file with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Set Up the Database

You have two options to set up the database:

### Option A: Using Supabase SQL Editor (Recommended)

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

### Option B: Using Supabase CLI

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

## Step 4: Verify Database Setup

After running the migration script, verify the setup:

1. **Check Tables**: Go to **Table Editor** in Supabase dashboard
   - You should see: `lga_reference`, `ward_reference`, `pu_reference`, `profiles`, `pvc_distributions`, `daily_pvc_summary`

2. **Check Data**: 
   - Open `lga_reference` table - should have 20 LGAs
   - Open `ward_reference` table - should have 15 wards for Sagamu

3. **Check Realtime**: 
   - Go to **Database** → **Replication**
   - Ensure all tables are enabled for realtime

4. **Check RLS Policies**:
   - Go to **Authentication** → **Policies**
   - Verify policies exist for `pvc_distributions` and `profiles`

## Step 5: Test the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will automatically:
- Connect to your Supabase database
- Sync data in real-time
- Use the seeded LGA and ward data

## Database Schema Overview

### Tables

1. **lga_reference** - Local Government Area reference data
   - `lga_code`: Primary key (e.g., "18" for Shagamu)
   - `lga_name`: Name of the LGA
   - `state_code`: State code (default "27" for Ogun)
   - `total_wards`: Number of wards in the LGA
   - `total_pus`: Number of polling units in the LGA

2. **ward_reference** - Ward reference data
   - `id`: UUID primary key
   - `ward_code`: Ward code within LGA
   - `ward_name`: Name of the ward
   - `lga_code`: Foreign key to lga_reference
   - `full_delimitation`: Full delimitation code (e.g., "27/18/01")
   - `total_pus`: Number of polling units in the ward

3. **pu_reference** - Polling Unit reference data
   - `id`: UUID primary key
   - `pu_code`: PU code within ward
   - `pu_name`: Name of the polling unit
   - `ward_code`: Foreign key reference
   - `lga_code`: Foreign key reference
   - `full_delimitation`: Unique full delimitation code

4. **profiles** - User profiles for officers and admins
   - `id`: UUID linked to auth.users
   - `full_name`: User's full name
   - `email`: Unique email
   - `role`: officer | admin | super_admin
   - `assigned_lga_code`: Assigned LGA
   - `assigned_ward_code`: Assigned ward
   - `is_active`: Account status

5. **pvc_distributions** - Main transaction table
   - `id`: UUID primary key
   - `vin`: Voter Identification Number (unique)
   - `full_name`: Voter's name
   - `delimitation_full`: Full delimitation from card
   - `lga_code`, `ward_code`, `pu_code`: Location hierarchy
   - `issued_by`: Officer who issued the PVC
   - `scan_method`: How the data was captured
   - `status`: issued | pending | cancelled

### Views

- **daily_pvc_summary** - Materialized view with daily aggregated statistics

### Functions

- **get_pvc_stats_by_hierarchy()** - Returns PVC statistics filtered by location and date range

## Real-Time Synchronization

The app uses Supabase Realtime for live data updates:

- All tables are enabled for realtime replication
- The client subscribes to changes in `pvc_distributions`
- Updates appear instantly across all connected clients
- No manual refresh needed

## Security Features

### Row Level Security (RLS)

- **Officers**: Can only view and update their own PVC distribution records
- **Admins/Super Admins**: Can view all records across all LGAs
- **Profile Access**: Users can only view/update their own profile

### Permissions

- All authenticated users can read/write to tables based on RLS policies
- Grants are applied to the `authenticated` role

## Troubleshooting

### Connection Issues

If the app shows warnings about missing credentials:

1. Verify `.env` file exists in the root directory
2. Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
3. Restart the development server after changing `.env`

### Missing Tables

If tables don't appear after running the migration:

1. Check the SQL Editor for any error messages
2. Ensure the `uuid-ossp` extension is enabled
3. Try running the script again (it uses `IF NOT EXISTS` to avoid duplicates)

### Realtime Not Working

If data doesn't sync in real-time:

1. Go to Database → Replication in Supabase dashboard
2. Ensure all tables are added to the `supabase_realtime` publication
3. Check browser console for any WebSocket connection errors

## Next Steps

1. Create user accounts in the **Authentication** section
2. Add user profiles manually or through the app
3. Start capturing PVC distributions
4. Monitor statistics through the dashboard

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review the SQL migration file for detailed schema information
- Check browser console and Supabase logs for errors
