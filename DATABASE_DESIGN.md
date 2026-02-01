# PolicyLens Database Design
## Production-Ready FinTech/InsurTech Schema

---

## 🎯 Design Philosophy

This database transforms PolicyLens from a demo into a **production-ready FinTech platform** while maintaining hackathon MVP speed. Every design decision balances:

✅ **Privacy-first** - No sensitive personal data  
✅ **User value** - Clear benefits for logged-in users  
✅ **Judge appeal** - Shows real-world thinking  
✅ **Scalability** - Ready for growth without overengineering

---

## 📊 Schema Overview

### **5 Core Tables**

1. **`users`** - Lightweight user profiles
2. **`policy_analyses`** - Analysis history (core feature)
3. **`clause_knowledge`** - Reusable AI explanations
4. **`user_insights`** - Anonymous question patterns
5. **`analysis_sessions`** - Guest/user tracking

---

## 🗄️ Table Specifications

### 1. **Users Table** - Privacy-First Profiles

**Purpose:** Minimal user data for personalization without privacy risk

```typescript
users {
  id: uuid (primary key)
  username: text (unique)
  password: text (nullable - OAuth users)
  googleId: text (nullable - local users)
  name: text
  email: text (unique)
  preferredLanguage: text (default: 'en')
  createdAt: timestamp
  lastLoginAt: timestamp
}
```

#### ✅ What We STORE:
- Basic auth identifiers (Google ID or username/password)
- Display name and email (account recovery only)
- Language preference (i18n ready)

#### ❌ What We DON'T STORE:
- ❌ Age, DOB, gender
- ❌ Income, employment, KYC data
- ❌ Phone numbers, Aadhaar, PAN
- ❌ Medical history or health data
- ❌ Address or location

**Why This Matters:**
> "We store only what's needed for a great user experience. Your personal details stay private."

**Indexes:**
- `email` (login lookup)
- `googleId` (OAuth lookup)

---

### 2. **Policy Analyses** - The Core Value Feature

**Purpose:** Demonstrates repeat usage and real platform behavior

```typescript
policy_analyses {
  id: uuid (primary key)
  userId: uuid (foreign key -> users, nullable)
  policyTitle: text
  policyType: enum (Health/Vehicle/Life/Home/Travel/Other)
  insuranceProvider: text
  
  // AI-generated insights
  plainLanguageSummary: text
  extractedExclusions: jsonb (array)
  extractedConditions: jsonb (array)
  riskLevel: enum (Low/Medium/High)
  
  // Comparison-ready fields
  waitingPeriodDays: integer
  coverageLimitAmount: integer
  majorExclusions: jsonb (array)
  claimRequirements: jsonb (array)
  
  analyzedAt: timestamp
}
```

#### 🎯 Business Value:

**For Users:**
- "View Past Analyses" feature
- Track policy changes over time
- Compare multiple policies side-by-side (future)

**For Judges:**
- Shows this is a **platform**, not a one-time tool
- Demonstrates data-driven decision making
- Privacy-compliant (no raw PDFs stored)

#### 🔒 Privacy Design:

**What We Store:**
- ✅ AI-generated summaries and insights
- ✅ Normalized metadata (provider, type, risk)

**What We DON'T Store:**
- ❌ **Raw policy PDFs** (deleted after analysis)
- ❌ Personal policy holder details
- ❌ Claim history or medical records

**Indexes:**
- `userId` (user's analysis history)
- `policyType` (analytics)
- `analyzedAt` (sorting)

---

### 3. **Clause Knowledge Store** - The Smart Differentiator

**Purpose:** Reusable AI explanations that improve consistency

```typescript
clause_knowledge {
  id: uuid (primary key)
  clauseText: text (unique, normalized)
  simplifiedExplanation: text
  realWorldExample: text
  category: enum (Exclusion/Condition/Waiting Period/etc.)
  frequencyCount: integer (default: 1)
  createdAt: timestamp
  lastUsedAt: timestamp
}
```

#### 💡 Competitive Advantage:

> **"PolicyLens learns common clause patterns and improves explanation consistency—without retraining AI models."**

**How It Works:**
1. User uploads policy → AI extracts clauses
2. System checks if clause exists in knowledge store
3. If found → reuse explanation (increment frequency)
4. If new → generate explanation, save for future

**Benefits:**
- ⚡ Faster analysis (cached explanations)
- 🎯 Consistent messaging across policies
- 📊 Shows "smart system" behavior to judges
- 💰 Reduces AI API costs over time

**Example:**
```
Clause: "Pre-existing diseases covered after 36 months"
Explanation: "Chronic conditions you already have (like diabetes) 
won't be covered for claims until 3 years after policy start."
Real-world: "If you file a diabetes-related claim in year 1 or 2, 
the insurer may reject it citing the waiting period."
Frequency: 847 (seen in 847 policies)
```

**Indexes:**
- `category` (clause type filtering)
- `frequencyCount` (popularity ranking)

---

### 4. **User Insights** - Anonymous Learning

**Purpose:** Identify confusion points without storing personal data

```typescript
user_insights {
  id: uuid (primary key)
  policyId: uuid (nullable, foreign key)
  normalizedQuestion: text
  category: enum (Coverage/Exclusion/Claim/Timing/etc.)
  isConfused: integer (0 or 1)
  askedAt: timestamp
}
```

#### 🔒 Privacy-First Design:

**What We DON'T Store:**
- ❌ User ID (fully anonymous)
- ❌ Raw chat transcripts
- ❌ IP addresses or session details
- ❌ Personally identifiable questions

**What We DO Store:**
- ✅ Normalized question patterns
- ✅ Question categories
- ✅ Timestamps (aggregate analysis only)

**Example Transformation:**
```
❌ Raw: "Is my Type 2 diabetes covered under policy #12345?"
✅ Stored: "Is <chronic_condition> covered?"
Category: Coverage
```

#### 📊 Business Intelligence:

**Analytics Queries:**
- "What are the top 10 most-asked question types?"
- "Which policy types cause the most confusion?"
- "Do users struggle more with Exclusions or Waiting Periods?"

**Actionable Insights:**
→ Improve UI/UX for common confusion points  
→ Pre-populate FAQ based on real user needs  
→ Train AI to proactively explain confusing clauses

**Judge Pitch:**
> "We learn where users struggle, not what they say. Privacy-first analytics."

**Indexes:**
- `category` (analytics)
- `askedAt` (time-series analysis)

---

### 5. **Analysis Sessions** - Guest vs. User Tracking

**Purpose:** Measure conversion and engagement without compromising privacy

```typescript
analysis_sessions {
  id: uuid (primary key)
  userId: uuid (nullable, foreign key)
  sessionToken: text (unique, temporary)
  isGuest: integer (1 = guest, 0 = logged in)
  policiesAnalyzed: integer
  questionsAsked: integer
  startedAt: timestamp
  lastActivityAt: timestamp
  expiresAt: timestamp (24-hour auto-expire)
}
```

#### 📊 Business Metrics:

**Guest Behavior:**
- How many policies do guests analyze before signing up?
- What percentage convert to registered users?
- When do drop-offs happen?

**User Engagement:**
- Power users vs. one-time users
- Feature adoption (analysis vs. chat)
- Retention over time

#### 🔒 Privacy Features:

**For Guests:**
- Temporary session tokens (not cookies)
- Auto-expire after 24 hours
- No permanent tracking

**For Users:**
- Activity tied to user ID (with consent)
- Can be deleted on account closure

**Indexes:**
- `userId` (user activity lookup)
- `sessionToken` (session retrieval)
- `expiresAt` (cleanup queries)

---

## 🔐 Security & Privacy Summary

### Data We NEVER Store:
- ❌ Raw policy PDFs (deleted after processing)
- ❌ Age, gender, income, employment
- ❌ Phone numbers, Aadhaar, PAN, KYC
- ❌ Medical records or claim history
- ❌ Raw chat logs or personal conversations
- ❌ Location data or IP addresses

### Data Retention Policy:
- **Guest sessions:** 24 hours (auto-delete)
- **Policy analyses:** User-controlled (can delete anytime)
- **User insights:** Anonymized aggregates only
- **Clause knowledge:** Permanent (no PII)

### Access Control:
- Users can ONLY view their own analyses
- Guest data never migrates to user accounts
- Row-level security via `userId` filtering
- Database indexes prevent data leakage

---

## 🚀 Scalability Features

### 1. **Efficient Indexing**
All foreign keys and frequent query columns are indexed:
- User lookups (email, googleId)
- Analysis filtering (userId, policyType, analyzedAt)
- Knowledge retrieval (category, frequency)
- Analytics (category, timestamps)

### 2. **JSONB for Flexibility**
Arrays stored as JSONB for:
- Fast querying without joins
- Schema evolution (add fields later)
- PostgreSQL native operators

### 3. **Enumeration Types**
Type-safe categories prevent bad data:
- Policy types (Health/Vehicle/Life/etc.)
- Risk levels (Low/Medium/High)
- Clause categories
- Question categories

### 4. **Cascade Deletions**
Clean data lifecycle:
- Delete user → auto-delete analyses
- Delete policy → nullify insights (preserve data)
- Session expiry → auto-cleanup

---

## 🎯 Hackathon Judge Appeal

### **What Makes This Database Special:**

#### 1. **Real Platform Behavior**
> "This isn't just an AI wrapper—users can view history, track analyses, and see system improvement over time."

#### 2. **Privacy Leadership**
> "We designed for GDPR/India's DPDP Act compliance from day one. No sensitive data, no overreach."

#### 3. **Future-Ready**
> "The schema supports policy comparison, i18n, and analytics without re-architecture."

#### 4. **Product Thinking**
> "We track conversion metrics, user confusion, and system efficiency—like a real startup."

#### 5. **Responsible AI**
> "Clause knowledge store shows we think about consistency, cost, and user trust—not just flashy demos."

---

## 📈 Demo Talking Points

### **For Non-Technical Judges:**

**Problem:** "Insurance companies hide exclusions in 50-page PDFs. Users sign blindly."

**Solution:** "PolicyLens uses AI to extract and explain risky clauses in under 30 seconds."

**Database Value:** "But we go further—users can track all past analyses, and our system learns common patterns to give better explanations over time. All while keeping your data private."

### **For Technical Judges:**

**Architecture:** "PostgreSQL with Drizzle ORM, type-safe enums, JSONB for flexibility, proper indexes, cascade rules."

**Privacy:** "No PII, no raw documents, 24-hour guest expiry, row-level access control."

**Scalability:** "Ready for 10K users tomorrow, 1M users next year—no re-architecture needed."

**Intelligence:** "Clause knowledge store creates a learning system without retraining models. Frequency tracking shows which clauses matter most."

---

## 🛠️ Implementation Checklist

- [x] Define schema with privacy-first design
- [x] Create enums for type safety
- [x] Add proper indexes for performance
- [x] Document every design decision
- [ ] Run database migrations (`npm run db:push`)
- [ ] Update API routes to use new tables
- [ ] Build "View Past Analyses" UI
- [ ] Add session management for guests
- [ ] Create admin analytics dashboard (optional)

---

## 🔄 Migration Command

```bash
npm run db:push
```

This applies the schema to your PostgreSQL database.

---

## 📝 Example Queries

### Get User's Analysis History
```sql
SELECT * FROM policy_analyses 
WHERE user_id = '...' 
ORDER BY analyzed_at DESC 
LIMIT 10;
```

### Top Confused Topics
```sql
SELECT category, COUNT(*) as count
FROM user_insights
WHERE is_confused = 1
GROUP BY category
ORDER BY count DESC;
```

### Most Common Clauses
```sql
SELECT clause_text, simplified_explanation, frequency_count
FROM clause_knowledge
ORDER BY frequency_count DESC
LIMIT 20;
```

### Guest Conversion Rate
```sql
SELECT 
  COUNT(CASE WHEN is_guest = 1 THEN 1 END) as guests,
  COUNT(CASE WHEN is_guest = 0 THEN 1 END) as users
FROM analysis_sessions
WHERE started_at > NOW() - INTERVAL '7 days';
```

---

## 🎓 Key Takeaways

This database design shows **real FinTech product thinking**:

1. ✅ Privacy isn't an afterthought—it's the foundation
2. ✅ Every table solves a real user or business problem
3. ✅ Data enables features, not just storage
4. ✅ Scalability is built-in, not bolted-on
5. ✅ Intelligence emerges from simple patterns

**Bottom Line:** This schema makes PolicyLens feel like a Series A startup, not a hackathon demo.
