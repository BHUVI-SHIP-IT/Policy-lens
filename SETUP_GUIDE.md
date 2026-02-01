# 🚀 PolicyLens Database Setup Guide

## Quick Start

### Step 1: Push Schema to Database

Run the following command to apply the new database schema:

```bash
npm run db:push
```

This will create all 5 tables in your PostgreSQL database:
- ✅ `users` - User profiles
- ✅ `policy_analyses` - Analysis history
- ✅ `clause_knowledge` - Reusable explanations
- ✅ `user_insights` - Anonymous question patterns
- ✅ `analysis_sessions` - Session tracking

### Step 2: (Optional) Switch to PostgreSQL Storage

Currently, the app uses in-memory storage (`MemStorage`) for quick development.

**To use real PostgreSQL:**

1. Open [server/storage.ts](server/storage.ts)
2. Replace the last line:

```typescript
// BEFORE (in-memory)
export const storage = new MemStorage();

// AFTER (PostgreSQL)
import { DbStorage } from "./db";
export const storage = new DbStorage();
```

3. Restart your server

### Step 3: (Optional) Seed Sample Data

To populate the database with demo clause knowledge:

```typescript
// In server/index.ts, add:
import { DbStorage, seedDatabase } from "./db";

// After server starts:
if (process.env.SEED_DB === "true") {
  const dbStorage = new DbStorage();
  await seedDatabase(dbStorage);
}
```

Then run:
```bash
SEED_DB=true npm run dev
```

---

## 📡 API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/auth/logout` - Logout
- `GET /api/user` - Get current user

### Policy Analyses
- `POST /api/analyses` - Create new analysis
- `GET /api/analyses` - Get user's analysis history (auth required)
- `GET /api/analyses/:id` - Get specific analysis (auth required)
- `DELETE /api/analyses/:id` - Delete analysis (auth required)

### Clause Knowledge
- `POST /api/clauses/explain` - Get or create clause explanation
- `GET /api/clauses/top?limit=20` - Get most common clauses

### User Insights
- `POST /api/insights` - Submit anonymized question
- `GET /api/insights/:category?limit=50` - Get insights by category

### Sessions
- `POST /api/session` - Create or retrieve session
- `PATCH /api/session/:id` - Update session activity
- `POST /api/session/cleanup` - Clean expired sessions

---

## 🔄 Example API Usage

### Create Policy Analysis

```typescript
const response = await fetch('/api/analyses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    policyTitle: "HDFC ERGO Health Insurance",
    policyType: "Health",
    insuranceProvider: "HDFC ERGO",
    plainLanguageSummary: "This policy covers hospitalization...",
    extractedExclusions: [
      "Pre-existing diseases covered after 36 months",
      "Cosmetic procedures excluded"
    ],
    extractedConditions: [
      "Hospitalization must exceed 24 hours"
    ],
    riskLevel: "Medium",
    waitingPeriodDays: 1095,
    coverageLimitAmount: 500000
  })
});

const analysis = await response.json();
```

### Get User's Analysis History

```typescript
const response = await fetch('/api/analyses?limit=10');
const history = await response.json();

// Returns array of past analyses, sorted by date
```

### Check/Create Clause Explanation

```typescript
const response = await fetch('/api/clauses/explain', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clauseText: "Pre-existing diseases covered after 36 months",
    simplifiedExplanation: "Chronic conditions won't be covered for 3 years",
    category: "Waiting Period",
    realWorldExample: "Diabetes claims rejected in first 3 years"
  })
});

const { clause, cached } = await response.json();
// cached: true if explanation already existed
```

### Submit Anonymous Insight

```typescript
await fetch('/api/insights', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    normalizedQuestion: "Is <chronic_condition> covered?",
    category: "Coverage",
    isConfused: 1
  })
});
```

---

## 🔐 Security Notes

### Row-Level Security

All policy analyses have `userId` enforcement:
- Users can ONLY view/delete their own analyses
- Guests cannot retrieve past analyses
- 403 Forbidden if unauthorized access attempted

### Session Expiry

```typescript
// Sessions auto-expire after 24 hours
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);
```

Run cleanup periodically:
```bash
curl -X POST http://localhost:5000/api/session/cleanup
```

### Data We Never Store
- ❌ Raw policy PDFs
- ❌ Personal medical data
- ❌ Raw chat transcripts
- ❌ User IDs in insights (anonymous)

---

## 📊 Sample Queries (PostgreSQL)

### Analytics Dashboard

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
GROUP BY category
ORDER BY confused_count DESC
LIMIT 10;

-- Most common clauses
SELECT 
  clause_text,
  simplified_explanation,
  frequency_count,
  category
FROM clause_knowledge
ORDER BY frequency_count DESC
LIMIT 20;

-- Guest vs. User conversion
SELECT 
  is_guest,
  COUNT(*) as sessions,
  AVG(policies_analyzed) as avg_policies,
  AVG(questions_asked) as avg_questions
FROM analysis_sessions
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY is_guest;

-- High-risk analyses
SELECT 
  policy_title,
  insurance_provider,
  risk_level,
  analyzed_at
FROM policy_analyses
WHERE risk_level = 'High'
ORDER BY analyzed_at DESC
LIMIT 50;
```

---

## 🧪 Testing Checklist

### Guest User Flow
- [ ] Can analyze policy without login
- [ ] Analysis NOT saved to database
- [ ] Session tracks activity
- [ ] Session expires after 24 hours

### Logged-In User Flow
- [ ] Can analyze policy
- [ ] Analysis saved to history
- [ ] Can view past analyses
- [ ] Can delete own analyses
- [ ] Cannot access other users' analyses

### Clause Knowledge
- [ ] First analysis creates clause
- [ ] Second analysis reuses clause
- [ ] Frequency count increments
- [ ] Top clauses API works

### Insights
- [ ] Questions stored anonymously
- [ ] No user ID attached
- [ ] Category filtering works

---

## 🔧 Environment Variables

Required in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

---

## 📈 Migration Path

### Current State: MemStorage
- ✅ Fast development
- ✅ No database setup needed
- ⚠️ Data lost on restart

### Production: DbStorage
- ✅ Persistent data
- ✅ Scalable
- ✅ Real user sessions
- ⚠️ Requires PostgreSQL

**Switch when:**
- Deploying to production
- Demo needs data persistence
- Testing real user flows

---

## 🎯 Hackathon Demo Tips

### For Judges (Non-Technical)

**Show Value:**
1. Upload policy → Get instant analysis
2. Sign in with Google
3. Show "Past Analyses" page
4. Highlight privacy (no PDFs stored)
5. Show clause reuse: "System learns patterns"

### For Judges (Technical)

**Show Architecture:**
1. Schema design (`DATABASE_DESIGN.md`)
2. API endpoints (`server/routes.ts`)
3. Privacy decisions (no PII, anonymous insights)
4. Scalability (indexes, JSONB, enums)
5. Storage abstraction (MemStorage → DbStorage)

**Key Metrics to Highlight:**
- Analysis count (shows usage)
- Clause frequency (shows intelligence)
- Insight categories (shows UX improvement)
- Session conversion (shows business thinking)

---

## 🐛 Troubleshooting

### "DATABASE_URL not found"
Ensure `.env` file exists with `DATABASE_URL`

### "Table does not exist"
Run `npm run db:push` to create tables

### "Cannot read property of undefined"
Check if user is authenticated for protected routes

### Data not persisting
Confirm you're using `DbStorage`, not `MemStorage`

---

## 📚 Further Reading

- [Full Database Design](DATABASE_DESIGN.md)
- [Schema Types](shared/schema.ts)
- [API Routes](server/routes.ts)
- [Storage Interface](server/storage.ts)
- [PostgreSQL Implementation](server/db.ts)

---

**Ready to impress judges? Run `npm run db:push` and you're live! 🚀**
