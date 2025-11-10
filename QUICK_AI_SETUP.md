# AI Integration - Quick Setup Guide

## 🚀 5-Minute Quick Start

### Step 1: Get Z.ai API Key (2 minutes)

1. Visit: https://z.ai/model-api
2. Sign up → Subscribe to **Coding Plan**
3. Create API key → Copy it
4. Key format: `zai_xxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 2: Install & Configure LiteLLM (3 minutes)

**Install**:
```bash
pip install litellm
```

**Create `.env`**:
```bash
ZAI_API_KEY=zai_your_actual_key_here
LITELLM_MASTER_KEY=sk-1234567890abcdef
```

**Create `litellm_config.yaml`**:
```yaml
model_list:
  - model_name: zai-coding
    litellm_params:
      model: openai/glm-4.6
      api_base: https://api.z.ai/api/coding/paas/v4
      api_key: os.environ/ZAI_API_KEY

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  cors_allowed_origins: ["*"]
```

**Start proxy**:
```bash
export $(cat .env | xargs)
litellm --config litellm_config.yaml --port 4000
```

**Test**:
```bash
curl http://localhost:4000/health
# Expected: {"status":"healthy"}
```

---

## 📊 Key Endpoints

| Purpose | URL |
|---------|-----|
| **Z.ai Coding API** | `https://api.z.ai/api/coding/paas/v4` |
| **LiteLLM Proxy** | `http://localhost:4000` |
| **LiteLLM Health** | `http://localhost:4000/health` |
| **LiteLLM Models** | `http://localhost:4000/models` |
| **Chat Completions** | `http://localhost:4000/chat/completions` |

---

## 🎯 Models Available

| Model | Use Case | Speed | Quality |
|-------|----------|-------|---------|
| `glm-4.6` | Complex code generation | Medium | ⭐⭐⭐⭐⭐ |
| `glm-4.5-air` | Simple/fast generation | Fast | ⭐⭐⭐⭐ |

**Recommendation**: Use `glm-4.6` for Mermaid diagrams

---

## 💻 Frontend Configuration

Add to your `index_1.html`:

```javascript
// At top of script
const AI_CONFIG = {
    endpoint: 'http://localhost:4000/chat/completions',
    apiKey: 'sk-1234567890abcdef',  // Your LITELLM_MASTER_KEY
    model: 'zai-coding'
};

// Example API call
async function generateDiagram(prompt) {
    const response = await fetch(AI_CONFIG.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.apiKey}`
        },
        body: JSON.stringify({
            model: AI_CONFIG.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a Mermaid diagram expert. Generate only Mermaid code.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}
```

---

## 🧪 Test Commands

**Test Z.ai directly**:
```bash
curl https://api.z.ai/api/coding/paas/v4/chat/completions \
  -H "Authorization: Bearer $ZAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4.6",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**Test LiteLLM proxy**:
```bash
curl http://localhost:4000/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "zai-coding",
    "messages": [{"role": "user", "content": "Generate Mermaid flowchart"}]
  }'
```

---

## 💰 Pricing

- **Cost per diagram**: ~$0.0005 (half a cent)
- **1000 diagrams**: ~$0.50
- **Monthly estimate** (100 diagrams): ~$0.05

**Very affordable!** 🎉

---

## 🛡️ Security Checklist

- [x] API key stored in `.env` (not in code)
- [x] `.env` added to `.gitignore`
- [x] LiteLLM master key configured
- [x] CORS configured for your domain
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured

---

## 🔧 Troubleshooting

### "Cannot find module 'litellm'"
```bash
pip install --upgrade litellm
```

### "401 Unauthorized"
Check your `.env` file:
```bash
cat .env
# Should show: ZAI_API_KEY=zai_...
```

### "CORS error"
Add to `litellm_config.yaml`:
```yaml
general_settings:
  cors_allowed_origins: ["*"]
```

### "Connection refused localhost:4000"
Start the proxy:
```bash
litellm --config litellm_config.yaml --port 4000
```

---

## 📚 Full Documentation

**Comprehensive guide**: `AI_INTEGRATION_GUIDE.md`
**Roadmap**: `ROADMAP.md` (Feature #11)

---

## ✅ Verification Checklist

Run these to verify everything works:

```bash
# 1. Health check
curl http://localhost:4000/health

# 2. List models
curl http://localhost:4000/models \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"

# 3. Test generation
curl http://localhost:4000/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "zai-coding",
    "messages": [
      {
        "role": "user",
        "content": "Create a simple Mermaid flowchart with A, B, C nodes"
      }
    ]
  }'
```

**If all 3 succeed**: ✅ You're ready to integrate!

---

## 🚀 Next Steps

1. ✅ Basic setup complete (above)
2. Add AI UI to `index_1.html` (see `AI_INTEGRATION_GUIDE.md`)
3. Test in browser
4. Deploy to production (Docker + HTTPS)

**Setup time**: 5-10 minutes
**Integration time**: 30-60 minutes

**You're ready to add AI to your Mermaid Visualizer!** 🎉
