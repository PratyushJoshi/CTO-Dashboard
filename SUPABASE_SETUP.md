# Supabase Setup Guide

This guide will help you set up Supabase for the CTO Dashboard application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and Yarn installed
- The CTO Dashboard codebase

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the project details:
   - Name: `cto-dashboard` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, go to the SQL Editor (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from this repository
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema
6. You should see a success message confirming all tables, policies, and functions were created

## Step 3: Configure Environment Variables

1. In your Supabase project dashboard, go to Settings > API
2. Copy the following values:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - `anon` public key (starts with `eyJ...`)
   - `service_role` secret key (starts with `eyJ...`) - KEEP THIS SECRET!

3. Create a `.env.local` file in the root of your project:

```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 4: Install Dependencies

```bash
yarn install
```

## Step 5: Start the Development Server

```bash
yarn dev
```

The application will now be running at http://localhost:3000

## Step 6: Create Your First User

### Option A: Using Supabase Dashboard

1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add user" > "Create new user"
3. Enter an email and password
4. Click "Create user"
5. The user profile will be automatically created via database trigger

### Option B: Using the Application (Coming Soon)

A sign-up page will be added to allow users to register directly through the application.

## Features Enabled

Once Supabase is configured, the following features are enabled:

### 1. User Authentication
- Secure login/logout
- User profiles with roles (admin, editor, viewer)
- Session management

### 2. Vendor Integrations
- Store vendor connections in the database
- Real-time updates when connections change
- Secure credential storage
- Multi-tenant support (each user sees only their integrations)

### 3. Metrics Storage
- Store metrics from all vendor integrations
- Time-series data for historical analysis
- Real-time metric updates
- Automatic data aggregation

### 4. Alerts System
- Define custom alert rules
- Automatic alert triggering based on metrics
- Alert acknowledgment and resolution tracking
- Real-time alert notifications

### 5. Row Level Security (RLS)
- Users can only access their own data
- Automatic data isolation
- Secure multi-tenant architecture

### 6. Real-time Subscriptions
- Live updates for vendor connections
- Real-time metric streaming
- Instant alert notifications
- No polling required

## Testing the Integration

### 1. Test Vendor Integration

1. Navigate to the "Integration" page
2. Click "Add Integration"
3. Select a vendor (e.g., Prometheus)
4. Fill in the integration details:
   - Name: "Test Integration"
   - API Key: "test-key-123"
   - Endpoint: "https://prometheus.example.com"
5. Click "Add Integration"
6. Click "Test" to verify the connection
7. Check your Supabase dashboard > Table Editor > vendor_integrations to see the stored data

### 2. Verify Real-time Updates

1. Open the Integration page in two browser tabs
2. In one tab, add a new integration
3. Watch the other tab automatically update with the new integration
4. This confirms real-time subscriptions are working

### 3. Check Metrics Storage

1. After testing a connection, metrics will be simulated and stored
2. Go to Supabase dashboard > Table Editor > metrics
3. You should see metric entries with timestamps

## Demo Mode (Without Supabase)

If you don't configure Supabase credentials, the application will run in demo mode:

- Uses localStorage for data persistence
- No authentication required
- No real-time updates
- Data is local to your browser
- Perfect for testing and development

## Troubleshooting

### Issue: "Supabase credentials not found"

**Solution**: Make sure your `.env.local` file exists and contains valid credentials. Restart the development server after adding credentials.

### Issue: "User not authenticated" errors

**Solution**: 
1. Check that you've created a user in Supabase
2. Make sure you're signed in (check the user menu in the navbar)
3. Verify your session hasn't expired

### Issue: Tables not found

**Solution**: 
1. Verify you ran the entire `schema.sql` file
2. Check for any SQL errors in the Supabase SQL Editor
3. Make sure all tables were created successfully

### Issue: Real-time updates not working

**Solution**:
1. Check that realtime is enabled for your tables (it's in the schema)
2. Verify your Supabase project has realtime enabled (it should be by default)
3. Check browser console for any subscription errors

### Issue: RLS policy errors

**Solution**:
1. Make sure you're authenticated
2. Verify RLS policies were created (check Supabase dashboard > Authentication > Policies)
3. Check that your user ID matches the user_id in the data

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Keep service_role key secret** - Only use it in server-side code
3. **Use anon key for client-side** - It's safe to expose in the browser
4. **Enable RLS on all tables** - Already done in the schema
5. **Regularly rotate API keys** - Do this in Supabase settings
6. **Use strong passwords** - For both Supabase and user accounts
7. **Enable 2FA** - On your Supabase account

## Next Steps

1. **Add Authentication UI**: Create login/signup pages
2. **Implement Real Vendor APIs**: Replace simulated API calls with actual vendor integrations
3. **Add Dashboard Customization**: Allow users to create custom dashboards
4. **Implement Alert Notifications**: Add email/SMS notifications for alerts
5. **Add Data Export**: Allow users to export their metrics
6. **Implement Team Features**: Add organization and team management

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the Supabase logs in your dashboard
3. Review this guide for common issues
4. Check the Supabase documentation
5. Open an issue in the repository

## Database Schema Overview

The schema includes:

- **user_profiles**: Extended user information
- **vendor_integrations**: Third-party vendor connections
- **metrics**: Generic metrics storage
- **infrastructure_metrics**: Infrastructure-specific metrics
- **api_performance_metrics**: API performance data
- **business_cost_metrics**: Cost and financial data
- **alert_rules**: User-defined alert rules
- **alerts**: Triggered alerts
- **dashboards**: Custom dashboard configurations
- **audit_logs**: Audit trail of user actions

All tables have:
- Row Level Security (RLS) enabled
- Automatic timestamps (created_at, updated_at)
- User-based data isolation
- Real-time subscriptions enabled
