/**
 * Simple Z.ai Proxy Backend for Mermaid Visualizer
 * Handles thinking mode, streaming, and SSE parsing properly
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Z.ai Configuration
const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_ENDPOINT = 'https://api.z.ai/api/coding/paas/v4/chat/completions';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Generate Mermaid diagram from natural language
 * POST /api/generate
 * Body: { prompt: string, diagramType: string, useThinking?: boolean }
 */
app.post('/api/generate', async (req, res) => {
  const { prompt, diagramType = 'flowchart', useThinking = true } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!ZAI_API_KEY) {
    return res.status(500).json({ error: 'ZAI_API_KEY not configured' });
  }

  // Build system prompt
  const systemPrompt = buildSystemPrompt(diagramType);

  // Build request payload
  const payload = {
    model: 'glm-4.6',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    stream: false // Non-streaming for simplicity
  };

  // Add thinking mode if enabled
  if (useThinking) {
    payload.thinking = { type: 'enabled' };
  }

  try {
    const response = await fetch(ZAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZAI_API_KEY}`,
        'Accept-Language': 'en-US,en'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Extract the generated code
    const generatedCode = data.choices[0].message.content;
    const reasoningContent = data.choices[0].message.reasoning_content || null;

    res.json({
      success: true,
      code: extractMermaidCode(generatedCode),
      reasoning: reasoningContent,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Z.ai API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Streaming endpoint for real-time generation
 * POST /api/generate/stream
 * Body: { prompt: string, diagramType: string, useThinking?: boolean }
 */
app.post('/api/generate/stream', async (req, res) => {
  const { prompt, diagramType = 'flowchart', useThinking = true } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!ZAI_API_KEY) {
    return res.status(500).json({ error: 'ZAI_API_KEY not configured' });
  }

  const systemPrompt = buildSystemPrompt(diagramType);

  const payload = {
    model: 'glm-4.6',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    stream: true // Enable streaming
  };

  if (useThinking) {
    payload.thinking = { type: 'enabled' };
  }

  try {
    const response = await fetch(ZAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ZAI_API_KEY}`,
        'Accept-Language': 'en-US,en'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Parse SSE stream from Z.ai
    const reader = response.body;

    let buffer = '';

    reader.on('data', (chunk) => {
      buffer += chunk.toString();

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            // Forward to client
            res.write(`data: ${JSON.stringify(parsed)}\n\n`);
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    });

    reader.on('end', () => {
      res.end();
    });

    reader.on('error', (error) => {
      console.error('Stream error:', error);
      res.end();
    });

  } catch (error) {
    console.error('Z.ai Streaming Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Build system prompt based on diagram type
 */
function buildSystemPrompt(diagramType) {
  const basePrompt = `You are an expert at creating Mermaid diagrams. Generate ONLY the Mermaid code without any explanations, markdown code blocks, or additional text. The code should be production-ready and follow Mermaid best practices.`;

  const typeSpecific = {
    flowchart: `Create a flowchart (use 'flowchart TD' or 'flowchart LR' syntax). Use appropriate node shapes: rectangles for processes, diamonds for decisions, circles for start/end.`,
    sequence: `Create a sequence diagram (use 'sequenceDiagram' syntax). Include participants, messages with arrows (->>, -->, ->>), and optional notes.`,
    class: `Create a class diagram (use 'classDiagram' syntax). Include classes with properties and methods, and relationships (inheritance, composition, association).`,
    state: `Create a state diagram (use 'stateDiagram-v2' syntax). Include states, transitions, and use [*] for start/end states.`,
    er: `Create an entity-relationship diagram (use 'erDiagram' syntax). Include entities with attributes and relationships (||--o{, }|--|{, etc.).`,
    gantt: `Create a Gantt chart (use 'gantt' syntax). Include title, dateFormat, sections, and tasks with start dates and durations.`
  };

  return `${basePrompt}\n\n${typeSpecific[diagramType] || typeSpecific.flowchart}`;
}

/**
 * Extract clean Mermaid code from AI response
 */
function extractMermaidCode(content) {
  let code = content.trim();

  // Remove markdown code blocks
  code = code.replace(/^```mermaid\n?/i, '');
  code = code.replace(/^```\n?/i, '');
  code = code.replace(/\n?```$/i, '');

  return code.trim();
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Z.ai Proxy Server running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/generate`);
  console.log(`   - POST /api/generate/stream`);
  console.log(`\n🔑 Z.ai API Key: ${ZAI_API_KEY ? '✓ Configured' : '✗ Missing'}`);
});
