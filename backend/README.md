# Mermaid Visualizer - AI Backend

Simple backend proxy for Z.ai API integration with proper thinking mode and streaming support.

## Why This Backend?

Instead of using LiteLLM (which doesn't support Z.ai's thinking mode), we created a **simple custom backend** that:

✅ **Properly handles Z.ai's thinking mode** - Preserves `reasoning_content`
✅ **Parses SSE streaming correctly** - No manual JSON parsing needed
✅ **Hides API keys securely** - Frontend never sees your Z.ai key
✅ **Handles errors gracefully** - Retry logic, timeouts, proper error messages
✅ **Simple & lightweight** - ~200 lines of code, easy to understand
✅ **Two language options** - Node.js or Python, your choice

---

## Quick Start

### Option 1: Node.js Backend (Recommended for Windows)

**1. Install dependencies:**
```bash
cd backend
npm install
```

**2. Configure API key:**
```bash
# Copy example env file
copy .env.example .env

# Edit .env and add your Z.ai API key:
# ZAI_API_KEY=zai_your_actual_key_here
```

**3. Start server:**
```bash
npm start
```

Server runs on `http://localhost:3001`

---

### Option 2: Python Backend

**1. Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**2. Configure API key:**
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Z.ai API key:
# ZAI_API_KEY=zai_your_actual_key_here
```

**3. Start server:**
```bash
python server.py
```

Server runs on `http://localhost:3001`

---

## API Endpoints

### `GET /health`

Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "zai_api_key_configured": true
}
```

---

### `POST /api/generate`

Generate Mermaid diagram from natural language (non-streaming)

**Request:**
```json
{
  "prompt": "Create a flowchart showing user login process",
  "diagramType": "flowchart",
  "useThinking": true
}
```

**Parameters:**
- `prompt` (required): Natural language description
- `diagramType` (optional): `flowchart`, `sequence`, `class`, `state`, `er`, `gantt`
- `useThinking` (optional): Enable Z.ai thinking mode (default: `true`)

**Response:**
```json
{
  "success": true,
  "code": "flowchart TD\n  A[Start] --> B[Login]...",
  "reasoning": "Let me think about the user login flow...",
  "model": "glm-4.6",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 200,
    "total_tokens": 250
  }
}
```

---

### `POST /api/generate/stream`

Generate Mermaid diagram with Server-Sent Events streaming

**Request:**
```json
{
  "prompt": "Create a sequence diagram for API authentication",
  "diagramType": "sequence",
  "useThinking": true
}
```

**Response:** Server-Sent Events stream

```
data: {"choices":[{"delta":{"reasoning_content":"Thinking about API auth..."}}]}

data: {"choices":[{"delta":{"content":"sequenceDiagram\n"}}]}

data: {"choices":[{"delta":{"content":"  User->>API: Request"}}]}

data: [DONE]
```

---

## Features

### ✅ Thinking Mode Support

Z.ai's thinking mode provides reasoning traces:

```json
{
  "thinking": {
    "type": "enabled"
  }
}
```

**Response includes both:**
- `reasoning_content`: Model's thought process
- `content`: Final Mermaid code

### ✅ Proper SSE Streaming

Correctly parses Z.ai's Server-Sent Events format:
- Handles `data:` prefixes
- Parses JSON chunks
- Detects `[DONE]` signal
- Forwards to frontend as clean SSE

### ✅ Error Handling

- HTTP error codes with messages
- Timeout handling (30s non-streaming, 60s streaming)
- Malformed JSON gracefully skipped
- Network failure recovery

### ✅ Security

- API key stored in `.env` (never in code)
- CORS configured for your frontend
- No API key exposure to client

---

## Frontend Integration

Update your `index_1.html` to call this backend:

```javascript
const AI_BACKEND = 'http://localhost:3001';

async function generateDiagram(prompt, diagramType) {
  const response = await fetch(`${AI_BACKEND}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      diagramType,
      useThinking: true
    })
  });

  const data = await response.json();

  if (data.success) {
    // Insert generated code into editor
    editorTextarea.value = data.code;

    // Optional: Show reasoning
    if (data.reasoning) {
      console.log('AI Reasoning:', data.reasoning);
    }

    // Render diagram
    await renderDiagram();
  } else {
    console.error('Generation failed:', data.error);
  }
}
```

---

## Streaming Example

```javascript
async function generateDiagramStreaming(prompt, diagramType) {
  const response = await fetch(`${AI_BACKEND}/api/generate/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      diagramType,
      useThinking: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let codeBuffer = '';
  let reasoningBuffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);

        if (data === '[DONE]') {
          // Streaming complete
          editorTextarea.value = codeBuffer;
          await renderDiagram();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices[0].delta;

          if (delta.reasoning_content) {
            reasoningBuffer += delta.reasoning_content;
            console.log('Reasoning:', reasoningBuffer);
          }

          if (delta.content) {
            codeBuffer += delta.content;
            // Update editor in real-time
            editorTextarea.value = codeBuffer;
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }
    }
  }
}
```

---

## Testing

### Test Health Endpoint

```bash
curl http://localhost:3001/health
```

**Expected:**
```json
{"status":"ok","zai_api_key_configured":true}
```

### Test Generation

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple flowchart with A, B, C nodes",
    "diagramType": "flowchart"
  }'
```

**Expected:**
```json
{
  "success": true,
  "code": "flowchart TD\n  A --> B\n  B --> C",
  "reasoning": "...",
  "model": "glm-4.6",
  "usage": {...}
}
```

---

## Production Deployment

### Node.js with PM2

```bash
npm install -g pm2
pm2 start server.js --name mermaid-ai-backend
pm2 save
pm2 startup
```

### Python with Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:3001 server:app
```

### Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server.js .
EXPOSE 3001
CMD ["node", "server.js"]
```

**Build & Run:**
```bash
docker build -t mermaid-ai-backend .
docker run -d -p 3001:3001 \
  -e ZAI_API_KEY=your_key_here \
  mermaid-ai-backend
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ZAI_API_KEY` | ✅ Yes | - | Your Z.ai API key |
| `PORT` | No | `3001` | Server port |
| `DEBUG` | No | `false` | Enable debug logging |

---

## Cost Tracking

The backend returns usage statistics:

```json
{
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 200,
    "total_tokens": 250
  }
}
```

**Cost calculation:**
- GLM-4.6: ~$0.001 per 1K tokens
- Average diagram: ~250 tokens
- **Cost per diagram**: ~$0.00025

Track costs by logging `usage` data.

---

## Troubleshooting

### "ZAI_API_KEY not configured"

**Solution**: Check `.env` file exists and has correct key:
```bash
# .env file
ZAI_API_KEY=zai_xxxxxxxxxxxxxxxxxxxxxxxx
```

### "Cannot connect to localhost:3001"

**Solution**: Ensure backend is running:
```bash
# Node.js
npm start

# Python
python server.py
```

### "HTTP 401 Unauthorized"

**Solution**: Invalid Z.ai API key. Check:
1. Key starts with `zai_`
2. Key is active in Z.ai dashboard
3. Subscribed to Coding Plan

### "CORS error"

**Solution**: Backend already has CORS enabled. If still issues, check:
- Frontend URL matches expected origin
- Browser isn't blocking localhost

---

## Comparison with LiteLLM

| Feature | Custom Backend | LiteLLM |
|---------|----------------|---------|
| **Z.ai Thinking Mode** | ✅ Full support | ❌ Not supported |
| **SSE Streaming** | ✅ Properly parsed | ⚠️ Generic handling |
| **Code Complexity** | ✅ ~200 lines | ⚠️ ~50K+ lines |
| **Setup Time** | ✅ 5 minutes | ⚠️ 15-30 minutes |
| **Dependencies** | ✅ 4 packages | ⚠️ 50+ packages |
| **Provider Flexibility** | ⚠️ Z.ai only | ✅ 100+ providers |
| **Cost Tracking** | ✅ Usage stats | ✅ Advanced tracking |
| **Rate Limiting** | ⚠️ Manual | ✅ Built-in |

**Verdict**: Custom backend is better for Z.ai-only use case. LiteLLM better if you need multi-provider support.

---

## License

MIT

---

## Support

Issues? Check:
1. `.env` file configured correctly
2. Z.ai API key is valid
3. Backend is running (`/health` returns 200)
4. Frontend calling correct URL

Still stuck? Open an issue on GitHub.
