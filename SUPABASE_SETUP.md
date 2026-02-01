# 🚀 Supabase Setup Guide for PolicyLens

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Fill in project details:
   - **Name:** PolicyLens
   - **Database Password:** (create a strong password - SAVE THIS!)
   - **Region:** Choose closest to your location
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

---

## Step 2: Get Database Connection String

### Finding Your Database Credentials in Supabase

1. In your Supabase project dashboard, click **"Project Settings"** (gear icon in bottom left)
2. Click **"Database"** in the sidebar
3. Scroll down to **"Connection string"** section
4. You'll see multiple options - look for **"Connection string"** tab
5. Find the **"URI"** or **"Postgres"** option

**If you don't see URI, here's how to build it manually:**

### Build Connection String from Project URL

Your Supabase shows:
- **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
- **API Keys:** (we won't use these for database connection)

**Extract your project reference ID:**
- From URL `https://abcdefghijk.supabase.co`, the reference is `abcdefghijk`

**Build the connection string:**
```
postgresql://postgres:[YOUR-DB-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Example:**
If your project URL is `https://abcdefghijk.supabase.co` and password is `MyPass123`:
```
postgresql://postgres:MyPass123@db.abcdefghijk.supabase.co:5432/postgres
```

**Important:** Use the **database password** you created when setting up the project, NOT the API keys!

### Alternative: Direct Database Settings

In **Settings → Database**, you'll see individual connection details:

- **Host:** `db.[project-ref].supabase.co`
- **Database name:** `postgres`
- **Port:** `5432`
- **User:** `postgres`
- **Password:** (the one you set during project creation)

Combine them into this format:
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

---

## Step 3: Update Your .env File

Replace the placeholder in your `.env` file with your actual connection string:

**Format:**
```env
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

**Real Example:**
If your project URL is `https://abcdefghijk.supabase.co` and password is `SecurePass123`:
```env
# Supabase Database
DATABASE_URL=postgresql://postgres:SecurePass123@db.abcdefghijk.supabase.co:5432/postgres

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Secret (change this in production)
SESSION_SECRET=your_random_session_secret
```

**⚠️ Common Mistakes:**
- ❌ Don't use the API keys (anon_key or service_role_key) - those are for Supabase client
- ❌ Don't use `https://` in DATABASE_URL - use `postgresql://`
- ✅ DO use your database password (the one from project creation)
- ✅ DO use `db.` prefix before your project reference

---

## Step 4: Push Database Schema

Run this command to create all tables in Supabase:

```bash
npm run db:push
```

You should see output like:
```
✓ Pushing schema changes to database
✓ Done!
```

---

## Step 5: Verify Tables in Supabase

1. Go to Supabase Dashboard
2. Click **"Table Editor"** (database icon)
3. You should see 5 new tables:
   - ✅ `users`
   - ✅ `policy_analyses`
   - ✅ `clause_knowledge`
   - ✅ `user_insights`
   - ✅ `analysis_sessions`

---

## Step 6: Enable Row Level Security (RLS) - Optional but Recommended

### For `policy_analyses` table:

1. Go to **Table Editor → policy_analyses**
2. Click **"RLS disabled"** badge
3. Enable RLS
4. Click **"Add Policy"**
5. Create policy:
   ```sql
   -- Users can only view their own analyses
   CREATE POLICY "Users view own analyses" 
   ON policy_analyses 
   FOR SELECT 
   USING (auth.uid()::text = user_id);
   
   -- Users can insert their own analyses
   CREATE POLICY "Users insert own analyses" 
   ON policy_analyses 
   FOR INSERT 
   WITH CHECK (auth.uid()::text = user_id);
   
   -- Users can delete their own analyses
   CREATE POLICY "Users delete own analyses" 
   ON policy_analyses 
   FOR DELETE 
   USING (auth.uid()::text = user_id);
   ```

**Note:** Since we're using Passport.js auth (not Supabase Auth), RLS is optional. Our API already handles authorization.

---

## Step 7: Switch to PostgreSQL Storage

Open `server/storage.ts` and update the last line:

```typescript
// BEFORE (in-memory)
export const storage = new MemStorage();

// AFTER (Supabase/PostgreSQL)
import { DbStorage } from "./db";
export const storage = new DbStorage();
```

---

## Step 8: Test the Connection

Start your development server:

```bash
npm run dev
```

You should see:
```
Server running on port 5000
Connected to database
```

If you see connection errors, check:
- DATABASE_URL is correct
- Password has no special characters (or is URL-encoded)
- Supabase project is running (not paused)

---

## 🎨 Supabase Features You Can Use

### 1. **Table Editor**
Visual interface to browse and edit data
- View all policy analyses
- Check clause knowledge growth
- Monitor user insights

### 2. **SQL Editor**
Run custom analytics queries:

```sql
-- Most analyzed policy types
SELECT policy_type, COUNT(*) as count
FROM policy_analyses
GROUP BY policy_type
ORDER BY count DESC;

-- Top confused topics
SELECT category, COUNT(*) as confused_count
FROM user_insights
WHERE is_confused = 1
GROUP BY category;
```

### 3. **Database Backups**
- Automatic daily backups (Pro plan)
- Point-in-time recovery
- Manual backups anytime

### 4. **Real-time Subscriptions** (Future Feature)
```typescript
// Listen to new policy analyses
supabase
  .from('policy_analyses')
  .on('INSERT', payload => {
    console.log('New analysis:', payload.new)
  })
  .subscribe()
```

### 5. **Database Webhooks**
Trigger external services when data changes:
- Send notification when high-risk policy detected
- Update analytics dashboard
- Log to external monitoring

---

## 🔒 Security Best Practices

### 1. **Never Commit .env**
Already in `.gitignore`:
```
.env
.env.local
```

### 2. **Use Environment Variables in Production**
For Replit/Vercel/Railway:
- Don't use `.env` file
- Set `DATABASE_URL` in platform settings

### 3. **Rotate Credentials**
If database password is exposed:
1. Go to Supabase Settings → Database
2. Click "Reset database password"
3. Update `DATABASE_URL` everywhere

### 4. **Connection Pooling**
For production with many concurrent users:
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true
```
Note the `:6543` port (not `:5432`)

---

## 📊 Monitoring Your Database

### Supabase Dashboard

1. **Database Health**
   - Settings → Database
   - View CPU/Memory usage
   - Check connection count

2. **Query Performance**
   - Click on any table
   - View row count
   - Check index usage

3. **Logs**
   - Settings → Logs
   - View recent queries
   - Debug errors

---

## 🧪 Seed Sample Data (Optional)

Create a seed script to populate demo data:

```typescript
// server/seed.ts
import { DbStorage, seedDatabase } from "./db";

async function main() {
  console.log("🌱 Seeding Supabase database...");
  const storage = new DbStorage();
  await seedDatabase(storage);
  console.log("✅ Seeding complete!");
  process.exit(0);
}

main().catch(console.error);
```

Add to `package.json`:
```json
{
  "scripts": {
    "db:seed": "tsx server/seed.ts"
  }
}
```

Run:
```bash
npm run db:seed
```

---

## 🚨 Troubleshooting

### Error: "connection refused"
- ✅ Check Supabase project is not paused
- ✅ Verify DATABASE_URL is correct
- ✅ Check firewall/network restrictions

### Error: "password authentication failed"
- ✅ Ensure you're using the **database password**, not API keys
- ✅ Database password was set when you created the project
- ✅ To reset: Settings → Database → "Reset database password"
- ✅ Check for special characters (URL encode them: `@` → `%40`, `#` → `%23`, etc.)

### "I forgot my database password!"
1. Go to **Settings → Database**
2. Scroll to **"Database Password"**
3. Click **"Reset database password"**
4. Copy the new password
5. Update DATABASE_URL in .env

### Error: "SSL required"
Add `?sslmode=require` to connection string:
```
postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres?sslmode=require
```

### Error: "too many connections"
- ✅ Use connection pooling (port 6543)
- ✅ Close database connections properly
- ✅ Upgrade Supabase plan for more connections

### Tables not appearing
- ✅ Run `npm run db:push` again
- ✅ Check Supabase Logs for errors
- ✅ Verify schema in `shared/schema.ts`

---

## 📈 Supabase Free Tier Limits

- **Database Size:** 500 MB
- **Bandwidth:** 5 GB/month
- **Monthly Active Users:** Unlimited
- **API Requests:** Unlimited
- **Backups:** 7 days retention

**For Hackathon:** Free tier is perfect! ✅

**For Production:** Consider Pro plan ($25/mo) for:
- 8 GB database
- 250 GB bandwidth
- Daily backups
- No project pausing

---

## 🎯 Next Steps

1. ✅ Create Supabase project
2. ✅ Add DATABASE_URL to .env
3. ✅ Run `npm run db:push`
4. ✅ Switch to DbStorage
5. ✅ Start server and test
6. ✅ View tables in Supabase dashboard

---

## 📞 Support

**Supabase Docs:** https://supabase.com/docs  
**Community:** https://discord.supabase.com  
**Status:** https://status.supabase.com

---

**You're now ready to use Supabase with PolicyLens! 🚀**
