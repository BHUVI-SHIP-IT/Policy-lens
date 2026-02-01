# 📋 PolicyLens Database Quick Reference

## 🚀 Setup Commands

```bash
# Apply schema to database
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📊 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User profiles | `id`, `username`, `email`, `googleId` |
| `policy_analyses` | Analysis history | `userId`, `policyTitle`, `riskLevel` |
| `clause_knowledge` | Reusable explanations | `clauseText`, `frequencyCount` |
| `user_insights` | Anonymous questions | `normalizedQuestion`, `category` |
| `analysis_sessions` | Session tracking | `sessionToken`, `isGuest`, `expiresAt` |

---

## 🔗 API Endpoints Cheat Sheet

### Analyses
```
POST   /api/analyses          Create analysis
GET    /api/analyses          Get user history
GET    /api/analyses/:id      Get specific
DELETE /api/analyses/:id      Delete analysis
```

### Clauses
```
POST   /api/clauses/explain   Get/create explanation
GET    /api/clauses/top       Most common clauses
```

### Insights
```
POST   /api/insights          Submit question
GET    /api/insights/:cat     Filter by category
```

### Sessions
```
POST   /api/session           Create/get session
PATCH  /api/session/:id       Update activity
POST   /api/session/cleanup   Expire old sessions
```

---

## 🎨 React Hooks

```typescript
// Policy Analysis
import { 
  usePolicyHistory,
  usePolicyAnalysis,
  useCreatePolicyAnalysis,
  useDeletePolicyAnalysis 
} from "@/hooks/use-policy-analysis";

// Clause Knowledge
import { 
  useClauseExplanation,
  useTopClauses 
} from "@/hooks/use-clause-knowledge";

// User Insights
import { 
  useSubmitInsight,
  normalizeQuestion,
  detectConfusion,
  categorizeQuestion 
} from "@/hooks/use-user-insights";

// Sessions
import { 
  useAnalysisSession 
} from "@/hooks/use-session";
```

---

## 📝 Example Usage

### Create Analysis
```typescript
const { mutate } = useCreatePolicyAnalysis();

mutate({
  policyTitle: "HDFC Health Insurance",
  policyType: "Health",
  insuranceProvider: "HDFC ERGO",
  plainLanguageSummary: "This policy covers...",
  extractedExclusions: ["Pre-existing after 36mo"],
  extractedConditions: ["24hr hospitalization"],
  riskLevel: "Medium"
});
```

### Get History
```typescript
const { data: analyses } = usePolicyHistory(10);

analyses?.map(a => (
  <div key={a.id}>
    <h3>{a.policyTitle}</h3>
    <p>{a.plainLanguageSummary}</p>
  </div>
));
```

### Submit Insight
```typescript
const { mutate } = useSubmitInsight();

mutate({
  normalizedQuestion: normalizeQuestion("Is dengue covered?"),
  category: categorizeQuestion("Is dengue covered?"),
  isConfused: detectConfusion("Is dengue covered?") ? 1 : 0
});
```

---

## 🔐 Privacy Checklist

- ✅ No raw PDFs stored
- ✅ No age, income, medical data
- ✅ Anonymous insights (no user IDs)
- ✅ 24hr session expiry
- ✅ Row-level security

---

## 📈 SQL Queries

### Top Policy Types
```sql
SELECT policy_type, COUNT(*) 
FROM policy_analyses 
GROUP BY policy_type 
ORDER BY COUNT(*) DESC;
```

### Confused Topics
```sql
SELECT category, COUNT(*) 
FROM user_insights 
WHERE is_confused = 1 
GROUP BY category;
```

### Popular Clauses
```sql
SELECT clause_text, frequency_count 
FROM clause_knowledge 
ORDER BY frequency_count DESC 
LIMIT 20;
```

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| Table doesn't exist | `npm run db:push` |
| Unauthorized error | User must login first |
| Data not persisting | Switch to `DbStorage` |
| Type errors | Check imports from `@shared/schema` |

---

## 🎯 Demo Flow

1. **Guest:** Analyze without login → Show privacy
2. **Login:** Sign in with Google → Show features unlock
3. **History:** View past analyses → Show platform value
4. **Learning:** Point to clause frequency → Show intelligence
5. **Privacy:** Show normalized insights → Show responsibility

---

**Quick Links:**
- [Full Design](DATABASE_DESIGN.md)
- [Setup Guide](SETUP_GUIDE.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
