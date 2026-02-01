# AI Integration Guide for PolicyLens

## Overview

PolicyLens now includes an **AI-powered reasoning engine** based on your custom system prompt. The AI analyzes insurance policies with privacy-first, clarity-focused principles.

## Current Status

- ✅ AI engine implemented ([server/ai-engine.ts](server/ai-engine.ts))
- ✅ API endpoints created (`/api/ai/analyze`, `/api/ai/chat`)
- ✅ React hooks ready ([client/src/hooks/use-ai-analysis.ts](client/src/hooks/use-ai-analysis.ts))
- ⏸️ **Mock mode active** (for demo without API costs)
- 🔄 **Ready to enable real AI** (uncomment code sections)

## Architecture

```
User Input → React Hook → API Endpoint → AI Engine → LLM API → Structured Response
```

### Files Created

1. **`server/ai-engine.ts`** - Core AI logic
   - `SYSTEM_PROMPT` - Your custom PolicyLens instructions
   - `analyzePolicyWithAI()` - Full policy analysis
   - `answerPolicyQuestion()` - Chat Q&A
   - Currently returns mock data (line 139-185)

2. **`client/src/hooks/use-ai-analysis.ts`** - React hooks
   - `useAIAnalysis()` - Analyze policy
   - `useAIChatQuestion()` - Ask questions

3. **API Endpoints** (in `server/routes.ts`)
   - `POST /api/ai/analyze` - Policy analysis (line 270)
   - `POST /api/ai/chat` - Question answering (line 306)

## How to Enable Real AI

### Step 1: Choose Your AI Provider

Pick one:
- **OpenAI** (GPT-4, GPT-4o) - Best for structured outputs
- **Anthropic** (Claude) - Excellent reasoning
- **Google Gemini** - Cost-effective
- **Other** (Groq, Together AI, etc.)

### Step 2: Install SDK

```bash
# For OpenAI
npm install openai

# For Anthropic
npm install @anthropic-ai/sdk

# For Google Gemini
npm install @google/generative-ai
```

### Step 3: Add API Key to `.env`

```env
# Add to .env file
AI_PROVIDER=openai
AI_API_KEY=sk-proj-...your-key-here...
AI_MODEL=gpt-4o
```

### Step 4: Update `server/ai-engine.ts`

Replace the mock implementations with real API calls:

#### For OpenAI (GPT-4):

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.AI_API_KEY });

export async function analyzePolicyWithAI(
  request: AnalysisRequest
): Promise<AIAnalysisResponse> {
  const prompt = `${SYSTEM_PROMPT}

------------------------------------
USER POLICY TEXT
------------------------------------
${request.policyText}

------------------------------------
POLICY TYPE
------------------------------------
${request.policyType || "General Insurance"}

------------------------------------
TASK
------------------------------------
Analyze this insurance policy and provide a structured JSON response with:
1. summary: Plain-language overview (2-3 sentences)
2. riskLevel: "Low", "Medium", or "High"
3. riskJustification: Why this risk level (1 sentence)
4. keyExclusions: Array of major exclusions in plain language
5. hiddenClauses: Array of conditional clauses that could block claims
6. claimRequirements: Array of what user must do to file a claim
7. waitingPeriods: Array of {condition, duration} objects
8. conditions: Array of {clause, plainLanguage, impact} objects

Respond ONLY with valid JSON. No markdown, no explanation.`;

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL || "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3, // Lower = more consistent
  });

  return JSON.parse(response.choices[0].message.content!);
}

export async function answerPolicyQuestion(
  policyText: string,
  question: string
): Promise<ChatResponse> {
  const prompt = `${SYSTEM_PROMPT}

------------------------------------
POLICY TEXT
------------------------------------
${policyText}

------------------------------------
USER QUESTION
------------------------------------
${question}

------------------------------------
TASK
------------------------------------
Answer the user's question using ONLY the policy text provided.
Respond with JSON containing:
1. answer: Direct answer in plain language (2-3 sentences max)
2. relevantClauses: Array of exact policy clauses that support the answer
3. confidence: "High" (clearly stated), "Medium" (implied/conditional), or "Low" (unclear)
4. disclaimer: Optional warning if conditions apply

Respond ONLY with valid JSON.`;

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL || "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

#### For Anthropic (Claude):

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.AI_API_KEY });

export async function analyzePolicyWithAI(
  request: AnalysisRequest
): Promise<AIAnalysisResponse> {
  const prompt = /* same prompt as above */;

  const response = await anthropic.messages.create({
    model: process.env.AI_MODEL || "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
    system: "You are a JSON API. Always respond with valid JSON only.",
  });

  const content = response.content[0];
  if (content.type === "text") {
    return JSON.parse(content.text);
  }
  throw new Error("Unexpected response format");
}
```

### Step 5: Enable AI in Frontend

#### Dashboard ([client/src/pages/dashboard.tsx](client/src/pages/dashboard.tsx))

Line 102: **Uncomment the AI analysis block**

```typescript
// Change this:
/*
analyzeWithAI({ policyText, policyType: "Health" }, {
  onSuccess: (result) => {
    ...
  }
});
return; // Remove this line
*/

// To this (remove /* and */):
analyzeWithAI({ policyText, policyType: "Health" }, {
  onSuccess: (result) => {
    setAiResult(result);
    setStatus("done");
    // ... rest of code
  }
});
return;
```

Line 138: **Comment out or delete the mock analysis** (after enabling AI)

#### Chat ([client/src/pages/chat.tsx](client/src/pages/chat.tsx))

Line 90: **Uncomment the AI chat block**

```typescript
// Change this:
/*
askAI({ policyText: policyContext, question: trimmed }, {
  onSuccess: (aiResponse) => {
    ...
  }
});
return; // Remove this line
*/

// To this (remove /* and */):
askAI({ policyText: policyContext, question: trimmed }, {
  onSuccess: (aiResponse) => {
    const botMsg: Msg = { 
      id: `b-${Date.now()}`, 
      role: "bot", 
      text: aiResponse.answer + (aiResponse.disclaimer ? `\n\n⚠️ ${aiResponse.disclaimer}` : "")
    };
    setMessages((m) => [...m, botMsg]);
  }
});
return;
```

Line 127: **Comment out or delete the mock responses** (after enabling AI)

## Testing AI Integration

### 1. Test Policy Analysis

```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "policyText": "Health insurance covers hospitalization after 30-day waiting period. Pre-existing conditions covered after 36 months.",
    "policyType": "Health"
  }'
```

### 2. Test Chat Questions

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "policyText": "Health insurance covers hospitalization after 30-day waiting period.",
    "question": "Is dengue covered?"
  }'
```

## Cost Optimization Tips

1. **Use smaller models for testing**
   - GPT-4o-mini instead of GPT-4o
   - Claude Haiku instead of Sonnet

2. **Cache policy context**
   - Store analyzed policies in database
   - Reuse analysis for similar questions

3. **Set token limits**
   ```typescript
   max_tokens: 2000, // Limit output length
   ```

4. **Add rate limiting**
   ```typescript
   // In server/routes.ts
   import rateLimit from 'express-rate-limit';
   
   const aiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 10 // 10 requests per window
   });
   
   app.post("/api/ai/analyze", aiLimiter, async (req, res) => { ... });
   ```

## Monitoring & Debugging

### Enable AI Logs

```typescript
// In server/ai-engine.ts
console.log("AI Request:", { policyLength: request.policyText.length, type: request.policyType });
console.log("AI Response:", JSON.stringify(result, null, 2));
```

### Check API Costs

- **OpenAI**: https://platform.openai.com/usage
- **Anthropic**: https://console.anthropic.com/usage
- **Google**: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/cost

## Fallback Strategy

Keep mock responses as fallback if AI fails:

```typescript
export async function analyzePolicyWithAI(
  request: AnalysisRequest
): Promise<AIAnalysisResponse> {
  try {
    // Try real AI first
    const aiResult = await callRealAI(request);
    return aiResult;
  } catch (error) {
    console.error("AI failed, using fallback:", error);
    
    // Return mock data as fallback
    return {
      summary: "Analysis temporarily unavailable. Using cached analysis.",
      riskLevel: "Medium",
      // ... mock data
    };
  }
}
```

## Next Steps

1. ✅ Choose AI provider (OpenAI recommended for structured outputs)
2. ✅ Get API key from provider dashboard
3. ✅ Add key to `.env` file
4. ✅ Install SDK (`npm install openai`)
5. ✅ Update `server/ai-engine.ts` with real API calls
6. ✅ Uncomment AI code in `dashboard.tsx` and `chat.tsx`
7. ✅ Test with sample policies
8. ✅ Monitor costs and performance
9. ✅ Add error handling and fallbacks

## Support

- Your system prompt is already integrated and ready
- All database integration is complete
- Frontend hooks are configured
- Just add your AI provider and uncomment the code!

**Total development time to enable AI: ~15 minutes** ⚡
