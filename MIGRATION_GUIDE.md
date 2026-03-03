# Migration Guide: Demo Mode to Production (Supabase)

This guide helps you migrate from demo mode (localStorage) to production mode (Supabase).

## Overview

The CTO Dashboard supports two modes:

- **Demo Mode**: Uses localStorage, no authentication, perfect for testing
- **Production Mode**: Uses Supabase, with authentication, real-time updates, and multi-tenant support

## Prerequisites

Before migrating:

1. ✅ Application running in demo mode
2. ✅ Vendor integrations configured in demo mode
3. ✅ Supabase account created
4. ✅ Database schema deployed
5. ✅ Environment variables configured

## Migration Steps

### Step 1: Backup Your Demo Data

Your demo data is stored in browser localStorage. To backup:

1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Find keys starting with `vendor_connections`
4. Copy the JSON data to a text file

### Step 2: Set Up Supabase

Follow the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide:

1. Create Supabase project
2. Run `supabase/schema.sql`
3. Copy credentials to `.env.local`
4. Restart development server

### Step 3: Create User Account

#### Option A: Via Supabase Dashboard

1. Go to Authentication > Users in Supabase dashboard
2. Click "Add user" > "Create new user"
3. Enter email and password
4. Click "Create user"

#### Option B: Via Application (Coming Soon)

A sign-up page will be added in a future update.

### Step 4: Sign In

1. Open the application
2. Check the navbar - you should see your email
3. If not signed in, you'll need to implement a login page or use Supabase dashboard

### Step 5: Recreate Vendor Integrations

Since demo data is in localStorage and production data is in Supabase, you'll need to recreate your integrations:

1. Go to Data Integration page
2. Click "Add Integration"
3. Select vendor type
4. Enter the same details as your demo integration
5. Click "Add Integration"
6. Repeat for all integrations

### Step 6: Verify Migration

1. Check that integrations appear in the UI
2. Test connections
3. Verify data in Supabase dashboard:
   - Go to Table Editor
   - Check `vendor_integrations` table
   - Verify your integrations are there

### Step 7: Clean Up Demo Data (Optional)

Once you've verified everything works:

1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Clear localStorage for your domain
4. Refresh the page

## Automated Migration (Advanced)

If you have many integrations, you can write a migration script:

```typescript
// migration-script.ts
import { supabase } from '@/lib/supabase/client';
import VendorIntegrationService from '@/services/VendorIntegrationService';

async function migrateToSupabase() {
  // Get demo data from localStorage
  const demoService = VendorIntegrationService.getInstance();
  const demoConnections = demoService.getAllConnections();

  console.log(`Found ${demoConnections.length} connections to migrate`);

  // Sign in first
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Please sign in first');
    return;
  }

  // Migrate each connection
  for (const connection of demoConnections) {
    try {
      const { data, error } = await supabase
        .from('vendor_integrations')
        .insert({
          user_id: user.id,
          vendor_type: connection.vendorType,
          name: connection.name,
          description: connection.description,
          credentials: connection.credentials,
          endpoint: connection.credentials.endpoint || null,
          status: connection.status,
          data_types: connection.dataTypes,
          config: connection.config,
        })
        .select()
        .single();

      if (error) {
        console.error(`Failed to migrate ${connection.name}:`, error);
      } else {
        console.log(`✓ Migrated ${connection.name}`);
      }
    } catch (error) {
      console.error(`Error migrating ${connection.name}:`, error);
    }
  }

  console.log('Migration complete!');
}

// Run migration
migrateToSupabase();
```

To use this script:

1. Save it as `scripts/migrate.ts`
2. Add a script to `package.json`:
   ```json
   "scripts": {
     "migrate": "tsx scripts/migrate.ts"
   }
   ```
3. Install tsx: `yarn add -D tsx`
4. Run: `yarn migrate`

## Rollback to Demo Mode

If you need to go back to demo mode:

1. Remove or rename `.env.local`
2. Restart development server
3. Application will automatically use demo mode
4. Your localStorage data will still be there

## Differences Between Modes

### Demo Mode

**Pros:**
- No setup required
- Works offline
- Fast and simple
- Perfect for testing

**Cons:**
- Data only in browser
- No authentication
- No real-time updates
- No multi-user support
- Data lost if localStorage cleared

### Production Mode

**Pros:**
- Data persisted in database
- User authentication
- Real-time updates
- Multi-user support
- Secure credential storage
- Audit logging
- Row-level security

**Cons:**
- Requires Supabase setup
- Needs internet connection
- More complex configuration

## Hybrid Approach

You can use both modes:

1. **Development**: Use demo mode for local development
2. **Staging**: Use Supabase with test data
3. **Production**: Use Supabase with real data

Just use different `.env.local` files for each environment.

## Troubleshooting

### Issue: Can't see my integrations after migration

**Solution:**
1. Check you're signed in (check navbar)
2. Verify user ID matches in database
3. Check RLS policies are enabled
4. Look for errors in browser console

### Issue: Real-time updates not working

**Solution:**
1. Verify Supabase credentials are correct
2. Check realtime is enabled in schema
3. Look for WebSocket errors in console
4. Try refreshing the page

### Issue: Authentication errors

**Solution:**
1. Verify user exists in Supabase
2. Check session hasn't expired
3. Try signing out and back in
4. Clear browser cookies and try again

### Issue: Data appears in both modes

**Solution:**
This is normal. Demo mode uses localStorage, production uses Supabase. They're separate data stores. Clear localStorage to remove demo data.

## Best Practices

1. **Test First**: Test the migration with one integration before migrating all
2. **Backup**: Always backup your demo data before migrating
3. **Verify**: Check each integration works after migration
4. **Document**: Keep track of which integrations you've migrated
5. **Clean Up**: Remove demo data after successful migration

## Data Retention

### Demo Mode
- Data stored in browser localStorage
- Persists until localStorage is cleared
- Limited to ~5-10MB per domain
- Not backed up

### Production Mode
- Data stored in Supabase PostgreSQL
- Persists indefinitely
- Backed up by Supabase
- Can be exported anytime

## Security Considerations

### Demo Mode
- Credentials stored in plain text in localStorage
- Anyone with access to browser can see data
- No encryption
- No audit trail

### Production Mode
- Credentials encrypted at rest
- Row-level security enforced
- Audit logging enabled
- HTTPS encryption in transit
- User authentication required

## Performance

### Demo Mode
- Instant reads (from memory)
- No network latency
- Limited by browser storage
- No real-time updates

### Production Mode
- Network latency for reads/writes
- Real-time updates via WebSocket
- Unlimited storage
- Database indexes for fast queries

## Cost Considerations

### Demo Mode
- Free (uses browser storage)
- No ongoing costs

### Production Mode
- Supabase free tier: 500MB database, 2GB bandwidth
- Paid plans start at $25/month
- Scales with usage

## Next Steps

After migration:

1. ✅ Test all integrations
2. ✅ Set up alert rules
3. ✅ Configure dashboards
4. ✅ Invite team members (coming soon)
5. ✅ Set up monitoring
6. ✅ Configure backups

## Support

Need help with migration?

1. Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. Review [troubleshooting section](#troubleshooting)
3. Check Supabase logs
4. Open an issue with details

## Conclusion

Migrating from demo to production mode is straightforward:

1. Set up Supabase
2. Create user account
3. Recreate integrations
4. Verify everything works

The application handles the rest automatically, including real-time updates and data isolation.
