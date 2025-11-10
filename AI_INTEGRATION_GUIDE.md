# AI-Assisted Diagram Generation - Implementation Guide

## 🤖 Z.ai + LiteLLM Integration

This guide shows how to integrate **Z.ai's Coding Endpoint** with **LiteLLM** to add AI-assisted diagram generation to the Mermaid Visualizer.

---

## Table of Contents

1. [Overview](#overview)
2. [Z.ai Configuration](#zai-configuration)
3. [LiteLLM Setup](#litellm-setup)
4. [Integration Options](#integration-options)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Implementation](#backend-implementation)
7. [Security Considerations](#security-considerations)
8. [Testing](#testing)
9. [Complete Code Examples](#complete-code-examples)

---

## Overview

### What We're Building

**Feature**: AI-assisted Mermaid diagram generation from natural language

**User Flow**:
```
User Input: "Create a flowchart showing user login with OAuth"
    ↓
Frontend: Sends prompt to backend
    ↓
Backend (LiteLLM): Routes to Z.ai coding endpoint
    ↓
Z.ai (GLM-4.6): Generates Mermaid code
    ↓
Frontend: Displays code in editor + auto-renders
```

**Tech Stack**:
- **Frontend**: Vanilla JavaScript (existing Mermaid Visualizer)
- **Backend**: LiteLLM Proxy (Python)
- **LLM Provider**: Z.ai Coding Plan (GLM-4.6 model)

---

## Z.ai Configuration

### 1. Get API Key

1. Visit https://z.ai/model-api
2. Sign up / Log in
3. Subscribe to **Coding Plan** (required for coding endpoint)
4. Navigate to **API Keys** section
5. Create new API key
6. Copy key (format: `zai_xxxxxxxxxxxxxxxxxxxxxxxx`)

### 2. Endpoint Details

**Z.ai Coding Endpoint**:
```
Base URL: https://api.z.ai/api/coding/paas/v4
Full Endpoint: https://api.z.ai/api/coding/paas/v4/chat/completions
```

**Available Models**:
- `glm-4.6` - Standard, complex tasks (recommended for code generation)
- `glm-4.5-air` - Lightweight, faster response

**Authentication**:
```http
Authorization: Bearer YOUR_ZAI_API_KEY
Content-Type: application/json
Accept-Language: en-US,en
```

### 3. Test Z.ai Directly (Optional)

**Curl Test**:
```bash
curl https://api.z.ai/api/coding/paas/v4/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ZAI_API_KEY" \
  -d '{
    "model": "glm-4.6",
    "messages": [
      {
        "role": "user",
        "content": "Generate a Mermaid flowchart showing user login process with OAuth authentication"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 2000
  }'
```

**Expected Response**:
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "glm-4.6",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "flowchart TD\n  A[User] --> B[Login Page]\n  B --> C{Has Account?}\n  C -->|Yes| D[OAuth Provider]\n  ..."
      },
      "finish_reason": "stop"
    }
  ]
}
```

---

## LiteLLM Setup

### 1. Install LiteLLM

**Option A: Direct Installation** (Recommended for development)
```bash
pip install litellm
```

**Option B: Docker** (Recommended for production)
```bash
docker pull ghcr.io/berriai/litellm:main-latest
```

### 2. Create Configuration File

Create `litellm_config.yaml`:

```yaml
model_list:
  - model_name: zai-coding
    litellm_params:
      model: openai/glm-4.6  # openai/ prefix for OpenAI-compatible endpoints
      api_base: https://api.z.ai/api/coding/paas/v4
      api_key: os.environ/ZAI_API_KEY  # Read from environment variable

  - model_name: zai-coding-fast
    litellm_params:
      model: openai/glm-4.5-air
      api_base: https://api.z.ai/api/coding/paas/v4
      api_key: os.environ/ZAI_API_KEY

# Optional: General settings
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY  # For securing your proxy

# Optional: Enable request logging
litellm_settings:
  success_callback: ["langfuse"]  # Track successful requests
  failure_callback: ["langfuse"]  # Track failed requests
```

### 3. Set Environment Variables

Create `.env` file:
```bash
# Z.ai API Key
ZAI_API_KEY=zai_your_actual_api_key_here

# LiteLLM Master Key (for securing proxy)
LITELLM_MASTER_KEY=sk-1234567890abcdef

# Optional: Enable debug logging
LITELLM_LOG=DEBUG
```

**Load environment variables**:
```bash
# Linux/Mac
export $(cat .env | xargs)

# Windows (PowerShell)
Get-Content .env | ForEach-Object {
  $name, $value = $_.split('=')
  Set-Content env:\$name $value
}
```

### 4. Start LiteLLM Proxy

**Development Mode**:
```bash
litellm --config litellm_config.yaml --port 4000
```

**Production Mode** (with Docker):
```bash
docker run -d \
  --name litellm-proxy \
  -p 4000:4000 \
  -v $(pwd)/litellm_config.yaml:/app/config.yaml \
  -e ZAI_API_KEY=$ZAI_API_KEY \
  -e LITELLM_MASTER_KEY=$LITELLM_MASTER_KEY \
  ghcr.io/berriai/litellm:main-latest \
  --config /app/config.yaml
```

**Verify proxy is running**:
```bash
curl http://localhost:4000/health
# Expected: {"status":"healthy"}
```

### 5. Test LiteLLM Proxy

**Test Request**:
```bash
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "zai-coding",
    "messages": [
      {
        "role": "user",
        "content": "Generate a Mermaid flowchart showing user authentication"
      }
    ]
  }'
```

**Using OpenAI SDK**:
```python
import openai

client = openai.OpenAI(
    api_key="sk-1234567890abcdef",  # Your LITELLM_MASTER_KEY
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="zai-coding",
    messages=[
        {"role": "user", "content": "Generate a Mermaid sequence diagram for API authentication"}
    ]
)

print(response.choices[0].message.content)
```

---

## Integration Options

### Option 1: Direct Frontend → Z.ai (Simple, Not Recommended)

**Pros**:
- No backend needed
- Simplest setup

**Cons**:
- ❌ Exposes API key in frontend (SECURITY RISK)
- ❌ No rate limiting
- ❌ No request monitoring
- ❌ CORS issues

**Use Case**: Personal tools, never production

---

### Option 2: Frontend → LiteLLM Proxy → Z.ai (Recommended)

**Pros**:
- ✅ API key hidden in backend
- ✅ Rate limiting & caching
- ✅ Request monitoring & logging
- ✅ Easy to switch providers (OpenAI, Anthropic, etc.)
- ✅ Cost tracking

**Cons**:
- Requires backend server
- Slightly more setup

**Use Case**: Production, team tools, public deployments

---

### Option 3: Frontend → Custom Backend → Z.ai (Maximum Control)

**Pros**:
- ✅ Full control over logic
- ✅ Custom prompt engineering
- ✅ Additional processing (validation, caching)
- ✅ User authentication & authorization

**Cons**:
- Most complex setup
- More code to maintain

**Use Case**: Enterprise, complex workflows

**We'll implement Option 2 (LiteLLM Proxy) as it provides the best balance.**

---

## Frontend Implementation

### 1. Add UI for AI Generation

Add to `index_1.html` settings panel:

```html
<!-- AI Generation Section (Add after Layout Engine section) -->
<div class="setting-group">
    <div class="setting-group-title">🤖 AI Diagram Generation</div>
    <div class="setting-item">
        <label class="setting-label" for="aiPrompt">Describe your diagram:</label>
        <textarea id="aiPrompt" class="setting-select" rows="4"
            placeholder="Example: Create a flowchart showing user login with OAuth, email verification, and error handling"
            style="resize: vertical; font-family: inherit;"></textarea>
        <div class="setting-description">Describe the diagram you want to create in natural language</div>
    </div>
    <div class="setting-item">
        <label class="setting-label" for="diagramType">Diagram Type:</label>
        <select id="diagramType" class="setting-select">
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence Diagram</option>
            <option value="class">Class Diagram</option>
            <option value="state">State Diagram</option>
            <option value="er">ER Diagram</option>
            <option value="gantt">Gantt Chart</option>
        </select>
    </div>
    <button id="generateDiagramBtn" class="btn btn-primary" style="width: 100%; margin-top: 8px;">
        ✨ Generate with AI
    </button>
    <div id="aiStatus" class="setting-description" style="margin-top: 8px; color: #6c757d;"></div>
</div>
```

### 2. Add JavaScript for AI Generation

Add to `<script>` section:

```javascript
// DOM elements for AI generation
const aiPrompt = document.getElementById('aiPrompt');
const diagramType = document.getElementById('diagramType');
const generateDiagramBtn = document.getElementById('generateDiagramBtn');
const aiStatus = document.getElementById('aiStatus');

// Configuration
const LITELLM_ENDPOINT = 'http://localhost:4000/chat/completions';
const LITELLM_API_KEY = 'sk-1234567890abcdef'; // Your LITELLM_MASTER_KEY

// Generate diagram with AI
async function generateDiagramWithAI() {
    const prompt = aiPrompt.value.trim();
    const type = diagramType.value;

    if (!prompt) {
        showStatus('Please describe your diagram first', 'error');
        return;
    }

    // Show loading state
    generateDiagramBtn.disabled = true;
    generateDiagramBtn.textContent = '⏳ Generating...';
    aiStatus.textContent = 'Sending request to AI...';
    aiStatus.style.color = '#0d6efd';

    try {
        // Build system prompt
        const systemPrompt = buildSystemPrompt(type);

        // Call LiteLLM proxy
        const response = await fetch(LITELLM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LITELLM_API_KEY}`
            },
            body: JSON.stringify({
                model: 'zai-coding',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const generatedCode = extractMermaidCode(data.choices[0].message.content);

        // Insert generated code into editor
        editorTextarea.value = generatedCode;

        // Auto-render
        await renderDiagram();

        // Update status
        aiStatus.textContent = '✅ Diagram generated successfully!';
        aiStatus.style.color = '#198754';
        showStatus('AI diagram generated successfully', 'success');

        // Close settings panel
        setTimeout(() => {
            settingsPanel.classList.remove('open');
        }, 1500);

    } catch (error) {
        console.error('AI generation error:', error);
        aiStatus.textContent = `❌ Error: ${error.message}`;
        aiStatus.style.color = '#dc3545';
        showStatus('AI generation failed', 'error');
    } finally {
        generateDiagramBtn.disabled = false;
        generateDiagramBtn.textContent = '✨ Generate with AI';
    }
}

// Build system prompt based on diagram type
function buildSystemPrompt(type) {
    const basePrompt = `You are an expert at creating Mermaid diagrams. Generate ONLY the Mermaid code without any explanations, markdown code blocks, or additional text. The code should be production-ready and follow Mermaid best practices.`;

    const typeSpecific = {
        flowchart: `Create a flowchart (use 'flowchart TD' or 'flowchart LR' syntax). Use appropriate node shapes: rectangles for processes, diamonds for decisions, circles for start/end.`,
        sequence: `Create a sequence diagram (use 'sequenceDiagram' syntax). Include participants, messages with arrows (->>, -->, ->>), and optional notes.`,
        class: `Create a class diagram (use 'classDiagram' syntax). Include classes with properties and methods, and relationships (inheritance, composition, association).`,
        state: `Create a state diagram (use 'stateDiagram-v2' syntax). Include states, transitions, and use [*] for start/end states.`,
        er: `Create an entity-relationship diagram (use 'erDiagram' syntax). Include entities with attributes and relationships (||--o{, }|--|{, etc.).`,
        gantt: `Create a Gantt chart (use 'gantt' syntax). Include title, dateFormat, sections, and tasks with start dates and durations.`
    };

    return `${basePrompt}\n\n${typeSpecific[type] || typeSpecific.flowchart}`;
}

// Extract Mermaid code from AI response
function extractMermaidCode(content) {
    // Remove markdown code blocks if present
    let code = content.trim();

    // Remove ```mermaid and ``` wrappers
    code = code.replace(/^```mermaid\n?/i, '');
    code = code.replace(/^```\n?/i, '');
    code = code.replace(/\n?```$/i, '');

    // Trim again
    code = code.trim();

    return code;
}

// Event listener
generateDiagramBtn.addEventListener('click', generateDiagramWithAI);
```

---

## Backend Implementation

### Complete LiteLLM Configuration

**Enhanced `litellm_config.yaml`**:

```yaml
model_list:
  # Z.ai Coding Models
  - model_name: zai-coding
    litellm_params:
      model: openai/glm-4.6
      api_base: https://api.z.ai/api/coding/paas/v4
      api_key: os.environ/ZAI_API_KEY
      max_tokens: 4000
      temperature: 0.7

  - model_name: zai-coding-fast
    litellm_params:
      model: openai/glm-4.5-air
      api_base: https://api.z.ai/api/coding/paas/v4
      api_key: os.environ/ZAI_API_KEY
      max_tokens: 2000
      temperature: 0.7

# General settings
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY

  # Allow CORS for frontend
  cors_allowed_origins: ["http://localhost:3000", "http://127.0.0.1:5500"]

  # Rate limiting (requests per minute per API key)
  rpm_limit: 30

  # Caching (saves money on repeated requests)
  cache: true
  cache_params:
    type: "redis"  # or "in-memory" for simple setup
    host: "localhost"
    port: 6379

# Logging
litellm_settings:
  drop_params: true  # Remove unused params before sending to provider
  set_verbose: true  # Enable detailed logging

# Budget & Cost tracking (optional)
router_settings:
  enable_pre_call_checks: true
```

### Production Deployment (Docker Compose)

**`docker-compose.yml`**:

```yaml
version: '3.8'

services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    container_name: litellm-proxy
    ports:
      - "4000:4000"
    environment:
      - ZAI_API_KEY=${ZAI_API_KEY}
      - LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}
    volumes:
      - ./litellm_config.yaml:/app/config.yaml
    command: ["--config", "/app/config.yaml", "--port", "4000"]
    restart: unless-stopped

  redis:  # For caching (optional)
    image: redis:7-alpine
    container_name: litellm-redis
    ports:
      - "6379:6379"
    restart: unless-stopped
```

**Start services**:
```bash
docker-compose up -d
```

---

## Security Considerations

### 1. **Never Expose Z.ai API Key in Frontend**

❌ **Bad** (API key in frontend):
```javascript
const ZAI_API_KEY = 'zai_1234567890abcdef';  // NEVER DO THIS
```

✅ **Good** (API key in backend):
```yaml
# litellm_config.yaml
api_key: os.environ/ZAI_API_KEY
```

### 2. **Use HTTPS in Production**

Configure reverse proxy (Nginx/Caddy):

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/your_cert.pem;
    ssl_certificate_key /etc/ssl/private/your_key.pem;

    location /ai/ {
        proxy_pass http://localhost:4000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. **Implement Rate Limiting**

Already handled by LiteLLM:
```yaml
general_settings:
  rpm_limit: 30  # 30 requests per minute
  tpm_limit: 100000  # 100k tokens per minute
```

### 4. **Add User Authentication** (Optional)

For multi-user deployments:

```yaml
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY

  # Create user-specific keys
  user_api_keys:
    - api_key: sk-user1-abc123
      user_id: user1@example.com
      rpm_limit: 10
    - api_key: sk-user2-def456
      user_id: user2@example.com
      rpm_limit: 20
```

### 5. **Content Filtering** (Optional)

Prevent abuse:

```python
# Add to frontend before sending
function validatePrompt(prompt) {
    const maxLength = 1000;
    const forbiddenPatterns = [
        /ignore previous instructions/i,
        /system prompt/i,
        // Add more as needed
    ];

    if (prompt.length > maxLength) {
        throw new Error('Prompt too long');
    }

    for (const pattern of forbiddenPatterns) {
        if (pattern.test(prompt)) {
            throw new Error('Invalid prompt content');
        }
    }

    return true;
}
```

---

## Testing

### 1. Test LiteLLM Proxy Endpoint

```bash
# Health check
curl http://localhost:4000/health

# Model info
curl http://localhost:4000/models \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY"

# Test generation
curl http://localhost:4000/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -d '{
    "model": "zai-coding",
    "messages": [
      {"role": "user", "content": "Create a simple Mermaid flowchart with 3 nodes"}
    ]
  }'
```

### 2. Test Frontend Integration

1. Open `index_1.html` in browser
2. Open Settings (`⚙️ Layout Settings`)
3. Scroll to `🤖 AI Diagram Generation`
4. Enter prompt: "Create a flowchart showing user registration process"
5. Click `✨ Generate with AI`
6. Verify:
   - Loading state appears
   - Code inserted into editor
   - Diagram auto-renders
   - Status shows success

### 3. Test Error Handling

**Test invalid API key**:
```javascript
const LITELLM_API_KEY = 'invalid-key';
// Should show error: "HTTP 401: Unauthorized"
```

**Test empty prompt**:
```javascript
aiPrompt.value = '';
generateDiagramBtn.click();
// Should show: "Please describe your diagram first"
```

**Test network failure**:
```javascript
const LITELLM_ENDPOINT = 'http://localhost:9999/chat/completions';
// Should show: "Network error"
```

---

## Complete Code Examples

### Full Frontend Code (Add to index_1.html)

```html
<!-- Add to settings panel HTML -->
<div class="setting-group">
    <div class="setting-group-title">🤖 AI Diagram Generation</div>
    <div class="setting-item">
        <label class="setting-label" for="aiPrompt">Describe your diagram:</label>
        <textarea id="aiPrompt" class="setting-select" rows="4"
            placeholder="Example: Create a flowchart showing user login with OAuth, email verification, and error handling"
            style="resize: vertical; font-family: inherit;"></textarea>
        <div class="setting-description">Describe the diagram you want to create in natural language</div>
    </div>
    <div class="setting-item">
        <label class="setting-label" for="diagramType">Diagram Type:</label>
        <select id="diagramType" class="setting-select">
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence Diagram</option>
            <option value="class">Class Diagram</option>
            <option value="state">State Diagram</option>
            <option value="er">ER Diagram</option>
            <option value="gantt">Gantt Chart</option>
        </select>
    </div>
    <button id="generateDiagramBtn" class="btn btn-primary" style="width: 100%; margin-top: 8px;">
        ✨ Generate with AI
    </button>
    <div id="aiStatus" class="setting-description" style="margin-top: 8px; color: #6c757d;"></div>
</div>

<script>
// Configuration (at top of script section)
const AI_CONFIG = {
    endpoint: 'http://localhost:4000/chat/completions',
    apiKey: 'sk-1234567890abcdef', // Your LITELLM_MASTER_KEY
    model: 'zai-coding',
    temperature: 0.7,
    maxTokens: 2000
};

// DOM elements (add to existing DOM elements section)
const aiPrompt = document.getElementById('aiPrompt');
const diagramType = document.getElementById('diagramType');
const generateDiagramBtn = document.getElementById('generateDiagramBtn');
const aiStatus = document.getElementById('aiStatus');

// Add event listener (in setupEventListeners function)
generateDiagramBtn.addEventListener('click', generateDiagramWithAI);

// AI Generation Functions
async function generateDiagramWithAI() {
    const prompt = aiPrompt.value.trim();
    const type = diagramType.value;

    if (!prompt) {
        showStatus('Please describe your diagram first', 'error');
        return;
    }

    // Validate prompt
    if (prompt.length > 1000) {
        showStatus('Prompt too long (max 1000 characters)', 'error');
        return;
    }

    // Show loading state
    generateDiagramBtn.disabled = true;
    generateDiagramBtn.textContent = '⏳ Generating...';
    aiStatus.textContent = 'Sending request to AI...';
    aiStatus.style.color = '#0d6efd';

    try {
        const systemPrompt = buildSystemPrompt(type);

        const response = await fetch(AI_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: AI_CONFIG.temperature,
                max_tokens: AI_CONFIG.maxTokens
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const generatedCode = extractMermaidCode(data.choices[0].message.content);

        // Insert into editor
        editorTextarea.value = generatedCode;

        // Auto-render
        aiStatus.textContent = 'Rendering diagram...';
        await renderDiagram();

        // Success
        aiStatus.textContent = '✅ Diagram generated successfully!';
        aiStatus.style.color = '#198754';
        showStatus('AI diagram generated successfully', 'success');

        // Close settings after delay
        setTimeout(() => {
            settingsPanel.classList.remove('open');
        }, 1500);

    } catch (error) {
        console.error('AI generation error:', error);
        aiStatus.textContent = `❌ Error: ${error.message}`;
        aiStatus.style.color = '#dc3545';
        showStatus('AI generation failed: ' + error.message, 'error');
    } finally {
        generateDiagramBtn.disabled = false;
        generateDiagramBtn.textContent = '✨ Generate with AI';
    }
}

function buildSystemPrompt(type) {
    const basePrompt = `You are an expert at creating Mermaid diagrams. Generate ONLY the Mermaid code without any explanations, markdown code blocks, or additional text. The code should be production-ready and follow Mermaid best practices.`;

    const typeSpecific = {
        flowchart: `Create a flowchart (use 'flowchart TD' or 'flowchart LR' syntax). Use appropriate node shapes: rectangles for processes, diamonds for decisions, circles for start/end.`,
        sequence: `Create a sequence diagram (use 'sequenceDiagram' syntax). Include participants, messages with arrows (->>, -->, ->>), and optional notes.`,
        class: `Create a class diagram (use 'classDiagram' syntax). Include classes with properties and methods, and relationships (inheritance, composition, association).`,
        state: `Create a state diagram (use 'stateDiagram-v2' syntax). Include states, transitions, and use [*] for start/end states.`,
        er: `Create an entity-relationship diagram (use 'erDiagram' syntax). Include entities with attributes and relationships (||--o{, }|--|{, etc.).`,
        gantt: `Create a Gantt chart (use 'gantt' syntax). Include title, dateFormat, sections, and tasks with start dates and durations.`
    };

    return `${basePrompt}\n\n${typeSpecific[type] || typeSpecific.flowchart}`;
}

function extractMermaidCode(content) {
    let code = content.trim();

    // Remove markdown code blocks
    code = code.replace(/^```mermaid\n?/i, '');
    code = code.replace(/^```\n?/i, '');
    code = code.replace(/\n?```$/i, '');

    return code.trim();
}
</script>
```

---

## Next Steps

### Phase 1: Basic Setup (1-2 hours)
1. ✅ Get Z.ai API key
2. ✅ Install LiteLLM
3. ✅ Configure `litellm_config.yaml`
4. ✅ Start proxy and test
5. ✅ Add frontend UI
6. ✅ Test end-to-end

### Phase 2: Enhancements (2-3 hours)
1. Add prompt templates (common diagram patterns)
2. Add diagram refinement (iterative improvement)
3. Add example gallery generated by AI
4. Add cost tracking display
5. Improve error messages

### Phase 3: Production (3-4 hours)
1. Deploy with Docker Compose
2. Set up HTTPS with reverse proxy
3. Add user authentication
4. Set up monitoring (logging, metrics)
5. Add usage analytics

---

## Cost Considerations

**Z.ai Coding Plan Pricing** (as of 2024):
- GLM-4.6: ~$0.001 per 1K tokens
- Average diagram generation: ~500 tokens
- **Cost per diagram**: ~$0.0005 (half a cent)

**For 1000 diagrams**: ~$0.50 (very affordable!)

**LiteLLM Caching**:
- Identical prompts served from cache (free)
- Can reduce costs by 50-70% for repeated requests

---

## Troubleshooting

### Issue: "401 Unauthorized"
**Cause**: Invalid API key
**Solution**:
- Check `.env` file has correct `ZAI_API_KEY`
- Verify key starts with `zai_`
- Check key is active in Z.ai dashboard

### Issue: "Cannot connect to localhost:4000"
**Cause**: LiteLLM proxy not running
**Solution**:
```bash
# Check if running
curl http://localhost:4000/health

# Restart proxy
litellm --config litellm_config.yaml --port 4000
```

### Issue: "CORS error in browser"
**Cause**: CORS not configured
**Solution**: Add to `litellm_config.yaml`:
```yaml
general_settings:
  cors_allowed_origins: ["*"]  # or specific origins
```

### Issue: AI generates invalid Mermaid code
**Cause**: Model hallucination or unclear prompt
**Solution**:
- Make prompt more specific
- Add examples in system prompt
- Use `glm-4.6` (better than 4.5-air for code)
- Lower temperature (0.3-0.5 for more deterministic)

---

## Summary

✅ **Z.ai Coding Endpoint**: `https://api.z.ai/api/coding/paas/v4`
✅ **Model**: `glm-4.6` (best for code generation)
✅ **Backend**: LiteLLM Proxy (Python, Docker-ready)
✅ **Authentication**: Bearer token (API key hidden in backend)
✅ **Cost**: ~$0.0005 per diagram (extremely affordable)
✅ **Setup Time**: 1-2 hours for basic, 3-4 hours for production

**You're ready to implement AI-assisted diagram generation!** 🚀

Start with Phase 1 (basic setup) and test locally, then move to production deployment.
