# INEC PVC Tracker - Supabase Integration Guide

## 🎯 Overview

This application is now fully integrated with **Supabase** for real-time database synchronization. The app will work both offline (with local mock data) and online (syncing with your Supabase database).

## 📋 Prerequisites

1. A Supabase account (free tier available at https://supabase.com)
2. Node.js 18+ installed
3. Your Supabase project credentials

## 🚀 Quick Start

### Step 1: Create Your Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Choose your organization
4. Enter project name (e.g., "inec-pvc-tracker")
5. Set a strong database password
6. Select region (choose closest to Nigeria for best performance)
7. Wait for project to be created (~2 minutes)

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cd /workspace/inec-pvc-tracker
cp .env.example .env
```

Edit `.env` and paste your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Set Up Database

#### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire SQL script from `SUPABASE_SETUP.md` (lines 36-277)
4. Paste into the editor
5. Click "Run" or press Ctrl+Enter
6. Wait for all tables to be created successfully

#### Option B: Using Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Push schema
supabase db push
```

### Step 5: Enable Realtime

After running the SQL script, realtime should already be enabled. To verify:

1. Go to **Database** → **Replication** in Supabase dashboard
2. Ensure these tables have realtime enabled:
   - ✅ pvc_distributions
   - ✅ profiles
   - ✅ lga_reference
   - ✅ ward_reference
   - ✅ pu_reference

### Step 6: Run the Application

```bash
npm install
npm run dev
```

The app will automatically detect your Supabase connection and sync data in real-time!

## 📊 Database Schema

The application uses these tables:

### Reference Tables
- **lga_reference**: 20 LGAs in Ogun State
- **ward_reference**: Wards per LGA (11-16 per LGA)
- **pu_reference**: Polling Units per Ward (8-56 per Ward)

### Transaction Tables
- **pvc_distributions**: PVC issuance records
- **profiles**: User accounts (officers, admins)

### Views & Functions
- **daily_pvc_summary**: Materialized view for statistics
- **get_pvc_stats_by_hierarchy()**: Aggregation function

## 🔐 Security (Row Level Security)

The database implements RLS policies:

- **Officers**: Can only see their own distribution records
- **Admins**: Can see all records in their assigned LGA
- **Super Admins**: Full access to all data

## 🔄 Real-time Features

Once connected to Supabase, the app provides:

1. **Live PVC Distribution Updates**: New distributions appear instantly
2. **Real-time Statistics**: Dashboard updates automatically
3. **Offline Support**: App works with local data if connection is lost
4. **Auto-reconnection**: Automatically reconnects when back online

## 📱 Usage Flow

### For Field Officers

1. Login with your credentials
2. Scan voter's PVC QR code or enter details manually
3. App validates delimitation code (27/XX/XX/XXX format)
4. Record is saved to Supabase instantly
5. Other officers see the update in real-time

### For Administrators

1. View dashboard with state-wide statistics
2. Filter by LGA, Ward, or date range
3. Monitor distribution progress in real-time
4. Export reports using the daily summary view

## 🛠️ Troubleshooting

### "Supabase not configured" warning

- Check that `.env` file exists in project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Restart the development server after changing `.env`

### Database tables not found

- Ensure you ran the complete SQL script from `SUPABASE_SETUP.md`
- Check Supabase dashboard → Table Editor to verify tables exist
- Re-run the SQL script if needed

### Realtime updates not working

- Verify realtime is enabled for `pvc_distributions` table
- Check browser console for connection errors
- Ensure your Supabase plan includes realtime (free tier does)

### RLS policy blocking access

- Make sure you're authenticated (user is logged in)
- Check user role in `profiles` table matches expected access level
- Review RLS policies in Supabase dashboard → Authentication → Policies

## 📈 Monitoring & Analytics

### Check Database Usage

In Supabase dashboard:
- **Database**: View table sizes and row counts
- **Logs**: Monitor queries and errors
- **Analytics**: Track API usage and performance

### Refresh Materialized View

To update the daily summary view:

```sql
REFRESH MATERIALIZED VIEW daily_pvc_summary;
```

Or create a scheduled job in Supabase to refresh hourly.

## 🔧 Advanced Configuration

### Customizing RLS Policies

Edit policies in Supabase dashboard or via SQL:

```sql
-- Example: Allow admins to see all records
CREATE POLICY admin_full_access ON pvc_distributions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
```

### Adding More Seed Data

Add more wards and polling units:

```sql
INSERT INTO ward_reference (ward_code, ward_name, lga_code, full_delimitation, total_pus)
VALUES ('16', 'New Ward', '18', '27/18/16', 20);

INSERT INTO pu_reference (pu_code, pu_name, ward_code, lga_code, full_delimitation)
VALUES ('009', 'New PU Location', '16', '18', '27/18/16/009');
```

### Backup & Restore

**Backup:**
```bash
supabase db dump -f backup.sql
```

**Restore:**
```bash
supabase db restore -f backup.sql
```

## 📞 Support

For issues or questions:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review `SUPABASE_SETUP.md` for detailed SQL scripts
3. Check browser console and Supabase logs for errors
4. Contact your system administrator

## ✅ Verification Checklist

After setup, verify:

- [ ] `.env` file created with correct credentials
- [ ] All 6 tables created in Supabase
- [ ] Seed data loaded (20 LGAs, sample wards)
- [ ] Realtime enabled for required tables
- [ ] RLS policies active
- [ ] App connects without errors
- [ ] Dashboard shows data from Supabase
- [ ] New PVC distributions sync in real-time

---

**Built with ❤️ for INEC Ogun State**

*Version: 1.0.0 | Last Updated: 2024*
